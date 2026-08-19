import logging

from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from app.permissions import CanViewEmployee, IsOwnerOrAdminRH

from .models import AdmissionProcess, Employee, EmployeeDocument, PreAdmissionRH
from .serializers import (
    AdmissionProcessSerializer,
    DocumentUploadSerializer,
    EmployeeCreateSerializer,
    EmployeeDocumentSerializer,
    EmployeeSerializer,
    PreAdmissionRHSerializer,
)
from .services import CEPService

logger = logging.getLogger(__name__)


class EmployeeViewSet(viewsets.ModelViewSet):
    """ViewSet for managing employee data and admission process"""

    queryset = Employee.objects.all()
    permission_classes = [permissions.IsAuthenticated, CanViewEmployee]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return EmployeeCreateSerializer
        return EmployeeSerializer

    def get_queryset(self):
        """Filter employees based on user role"""
        user = self.request.user
        if user.is_admin_rh:
            return Employee.objects.all()
        # Regular employees can only see their own data
        return Employee.objects.filter(user=user)

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        """Create employee record during admission process"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Create employee linked to current user
        employee = serializer.save(user=request.user)

        # Create admission process
        AdmissionProcess.objects.create(employee=employee, personal_info_completed=True)

        return Response(EmployeeSerializer(employee).data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        """Update employee with proper response serialization"""
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        # Perform the update
        employee = serializer.save()

        # Return the full employee data
        return Response(EmployeeSerializer(employee).data)

    def partial_update(self, request, *args, **kwargs):
        """Partial update employee with proper response serialization"""
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)

    @action(detail=True, methods=["patch"])
    def update_personal_info(self, request, pk=None):
        """Update personal information"""
        employee = self.get_object()
        serializer = EmployeeCreateSerializer(employee, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        # Update admission process
        if hasattr(employee, "admission_process"):
            employee.admission_process.personal_info_completed = True
            employee.admission_process.save()

        return Response(EmployeeSerializer(employee).data)

    @action(detail=True, methods=["get"])
    def admission_status(self, request, pk=None):
        """Get admission process status"""
        employee = self.get_object()
        if hasattr(employee, "admission_process"):
            return Response(AdmissionProcessSerializer(employee.admission_process).data)
        else:
            # Create admission process if it doesn't exist
            admission_process = AdmissionProcess.objects.create(employee=employee)
            return Response(AdmissionProcessSerializer(admission_process).data)

    @action(detail=False, methods=["get"])
    def my_profile(self, request):
        """Get current user's employee profile"""
        try:
            employee = Employee.objects.get(user=request.user)
            return Response(EmployeeSerializer(employee).data)
        except Employee.DoesNotExist:
            return Response(
                {"detail": "Perfil de funcionário não encontrado."},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=["post"])
    def create_profile(self, request):
        """Create employee profile for current user"""
        if Employee.objects.filter(user=request.user).exists():
            return Response(
                {"detail": "Perfil já existe para este usuário."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return self.create(request)

    @action(detail=False, methods=["post"])
    def lookup_cep(self, request):
        """Lookup address information from CEP"""
        cep = request.data.get("cep")

        if not cep:
            return Response({"error": "CEP é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)

        # Validate CEP format
        if not CEPService.validate_cep(cep):
            return Response(
                {"error": "CEP deve conter 8 dígitos."}, status=status.HTTP_400_BAD_REQUEST
            )

        # Fetch address data
        address_data = CEPService.fetch_address(cep)

        if not address_data:
            return Response({"error": "CEP não encontrado."}, status=status.HTTP_404_NOT_FOUND)

        # Format response to match Employee model fields
        formatted_data = {
            "zip_code": CEPService.format_cep(address_data["cep"]),
            "street_address": address_data["street"],
            "neighborhood": address_data["neighborhood"],
            "city": address_data["city"],
            "state": address_data["state"],
            "complement": address_data["complement"],
        }

        return Response(formatted_data)


class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    """ViewSet for managing employee documents"""

    serializer_class = EmployeeDocumentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminRH]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        """Filter documents to the requester's own employee record, unless HR"""
        user = self.request.user
        if user.is_admin_rh:
            queryset = EmployeeDocument.objects.all()
        else:
            queryset = EmployeeDocument.objects.filter(employee__user=user)

        employee_id = self.kwargs.get("employee_pk")
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)

        return queryset

    def get_serializer_class(self):
        if self.action == "create":
            return DocumentUploadSerializer
        return EmployeeDocumentSerializer

    def create(self, request, *args, **kwargs):
        """Enhanced create method with better error handling"""
        try:
            logger.debug("Document upload request: data=%s files=%s", request.data, request.FILES)

            # Call parent create method
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error("Error in document upload: %s", e)
            return Response(
                {"error": f"Erro ao fazer upload do documento: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def perform_create(self, serializer):
        """Create document for specific employee"""
        user = self.request.user
        employee_id = self.kwargs.get("employee_pk")

        if user.is_admin_rh:
            if employee_id:
                employee = get_object_or_404(Employee, id=employee_id)
            else:
                employee = get_object_or_404(Employee, user=user)
        else:
            # Regular users may only upload documents to their own record,
            # regardless of which employee_pk was requested in the URL.
            employee = get_object_or_404(Employee, user=user)

        # Save document with employee
        document = serializer.save(employee=employee)

        # Update admission process if exists
        try:
            if hasattr(employee, "admission_process"):
                # Check if required documents are uploaded
                required_docs = employee.documents.filter(is_required=True)
                if required_docs.count() >= 3:  # Minimum required documents
                    employee.admission_process.documents_uploaded = True
                    employee.admission_process.save()
            else:
                # Create admission process if it doesn't exist
                AdmissionProcess.objects.get_or_create(
                    employee=employee,
                    defaults={
                        "documents_uploaded": True if employee.documents.count() >= 3 else False
                    },
                )
        except Exception as e:
            # Log error but don't fail document upload
            logger.warning("Error updating admission process: %s", e)

        return document

    @action(detail=True, methods=["patch"])
    def verify(self, request, pk=None, employee_pk=None):
        """Verify a document (HR only)"""
        if not request.user.is_admin_rh:
            return Response({"detail": "Permissão negada."}, status=status.HTTP_403_FORBIDDEN)

        document = self.get_object()
        document.is_verified = request.data.get("is_verified", False)
        document.save()

        return Response(EmployeeDocumentSerializer(document).data)

    @action(detail=False, methods=["get"])
    def required_documents(self, request, employee_pk=None):
        """Get list of required document types"""
        required_docs = [
            {"type": "rg", "name": "RG", "required": True},
            {"type": "birth_certificate", "name": "Certidão de Nascimento", "required": True},
            {
                "type": "education_certificate",
                "name": "Comprovante de Escolaridade",
                "required": True,
            },
            {"type": "work_card", "name": "Carteira de Trabalho", "required": True},
            {"type": "medical_exam", "name": "Exame Admissional", "required": True},
            {"type": "bank_document", "name": "Comprovante Bancário", "required": False},
            {"type": "address_proof", "name": "Comprovante de Endereço", "required": False},
            {"type": "marriage_certificate", "name": "Certidão de Casamento", "required": False},
            {"type": "other", "name": "Outros", "required": False},
        ]

        return Response(required_docs)


class AdmissionProcessViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for tracking admission processes"""

    queryset = AdmissionProcess.objects.all()
    serializer_class = AdmissionProcessSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdminRH]

    def get_queryset(self):
        """Filter based on user permissions"""
        user = self.request.user
        if user.is_admin_rh:
            return AdmissionProcess.objects.all()
        # Regular employees can only see their own process
        return AdmissionProcess.objects.filter(employee__user=user)

    @action(detail=True, methods=["patch"])
    def update_status(self, request, pk=None):
        """Update admission process status (HR only)"""
        process = self.get_object()

        # Only HR can update status
        if not request.user.is_admin_rh:
            return Response({"detail": "Permissão negada."}, status=status.HTTP_403_FORBIDDEN)

        status_value = request.data.get("status")
        notes = request.data.get("notes", "")

        if status_value:
            process.status = status_value
            process.notes = notes

            # Update completion flags based on status
            if status_value == "approved":
                process.hr_review_completed = True
            elif status_value == "completed":
                process.hr_review_completed = True
                process.completed_at = timezone.now()
                # Update employee status
                process.employee.status = "active"
                process.employee.admission_completed = True
                process.employee.save()

            process.save()

        return Response(AdmissionProcessSerializer(process).data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get admission process statistics (HR only)"""
        if not request.user.is_admin_rh:
            return Response({"detail": "Permissão negada."}, status=status.HTTP_403_FORBIDDEN)

        stats = {
            "total_processes": AdmissionProcess.objects.count(),
            "pending_review": AdmissionProcess.objects.filter(status="documents_uploaded").count(),
            "approved": AdmissionProcess.objects.filter(status="approved").count(),
            "completed": AdmissionProcess.objects.filter(status="completed").count(),
            "rejected": AdmissionProcess.objects.filter(status="rejected").count(),
        }

        return Response(stats)


class PreAdmissionRHViewSet(viewsets.ModelViewSet):
    """ViewSet for managing HR pre-admission process"""

    queryset = PreAdmissionRH.objects.all()
    serializer_class = PreAdmissionRHSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """Filter based on user permissions - only HR and Admin can access"""
        user = self.request.user
        if user.is_admin_rh:
            return PreAdmissionRH.objects.all()
        else:
            # Regular employees cannot access pre-admission data
            return PreAdmissionRH.objects.none()

    def perform_create(self, serializer):
        """Create pre-admission record with creator info"""
        pre_admission = serializer.save(created_by=self.request.user)
        return pre_admission

    @action(detail=True, methods=["post"])
    def create_employee_account(self, request, pk=None):
        """Create employee user account and send email"""
        pre_admission = self.get_object()

        # Check permissions
        if not request.user.is_admin_rh:
            return Response(
                {"detail": "Permissão negada. Apenas administradores RH podem criar contas."},
                status=status.HTTP_403_FORBIDDEN,
            )

        try:
            with transaction.atomic():
                # Create user and employee
                user, employee = pre_admission.create_employee_user()

                if user:
                    # Send admission email
                    email_sent = pre_admission.send_admission_email()

                    return Response(
                        {
                            "message": "Conta criada com sucesso!",
                            "employee_id": employee.id,
                            "email_sent": email_sent,
                            "login_email": pre_admission.personal_email,
                            "temporary_password": pre_admission.temporary_password,
                        },
                        status=status.HTTP_201_CREATED,
                    )
                else:
                    return Response(
                        {
                            "message": "Conta já existe para este pré-cadastro.",
                            "employee_id": pre_admission.employee.id
                            if pre_admission.employee
                            else None,
                        },
                        status=status.HTTP_200_OK,
                    )

        except Exception as e:
            return Response(
                {"error": f"Erro ao criar conta: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=["post"])
    def resend_email(self, request, pk=None):
        """Resend admission email to employee"""
        pre_admission = self.get_object()

        # Check permissions
        if not request.user.is_admin_rh:
            return Response({"detail": "Permissão negada."}, status=status.HTTP_403_FORBIDDEN)

        if not pre_admission.employee_user_created:
            return Response(
                {"error": "Conta do funcionário ainda não foi criada."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Reset email sent flag and send again
        pre_admission.email_sent = False
        pre_admission.save()

        email_sent = pre_admission.send_admission_email()

        return Response(
            {
                "message": "E-mail reenviado!" if email_sent else "Erro ao enviar e-mail.",
                "email_sent": email_sent,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=["get"])
    def pending_accounts(self, request):
        """Get list of pre-admissions that need account creation"""
        if not request.user.is_admin_rh:
            return Response({"detail": "Permissão negada."}, status=status.HTTP_403_FORBIDDEN)

        pending = PreAdmissionRH.objects.filter(employee_user_created=False)
        serializer = self.get_serializer(pending, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def statistics(self, request):
        """Get pre-admission statistics"""
        if not request.user.is_admin_rh:
            return Response({"detail": "Permissão negada."}, status=status.HTTP_403_FORBIDDEN)

        stats = {
            "total_pre_admissions": PreAdmissionRH.objects.count(),
            "accounts_created": PreAdmissionRH.objects.filter(employee_user_created=True).count(),
            "emails_sent": PreAdmissionRH.objects.filter(email_sent=True).count(),
            "pending_accounts": PreAdmissionRH.objects.filter(employee_user_created=False).count(),
        }

        return Response(stats)
