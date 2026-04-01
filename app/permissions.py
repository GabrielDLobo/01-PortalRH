from rest_framework.permissions import BasePermission
from typing import Any


class IsAdminRH(BasePermission):
    """
    Permission that only allows admin RH users
    """

    def has_permission(self, request, view) -> bool:
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin_rh
        )


class IsOwnerOrAdminRH(BasePermission):
    """
    Permission that allows owners of the object or admin RH users
    """

    def has_object_permission(self, request, view, obj) -> bool:
        # Admin RH can access everything
        if request.user.is_admin_rh:
            return True

        # Check if user owns the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'solicitante'):
            return obj.solicitante == request.user
        elif hasattr(obj, 'avaliado'):
            return obj.avaliado == request.user or obj.avaliador == request.user

        return False


class CanViewEmployee(BasePermission):
    """
    Permission for viewing employee data based on role hierarchy
    """

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        # Admin RH can view all employees
        if user.is_admin_rh:
            return True

        # Employees can view their own data
        if hasattr(obj, 'user') and obj.user == user:
            return True

        return False


class CanManageEmployee(BasePermission):
    """
    Permission for managing employee data
    """

    def has_permission(self, request, view) -> bool:
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin_rh
        )

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        # Admin RH can manage all employees
        if user.is_admin_rh:
            return True

        return False


class CanApproveLeaveRequest(BasePermission):
    """
    Permission for approving leave requests
    """

    def has_permission(self, request, view) -> bool:
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin_rh
        )

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        # Admin RH can approve all requests
        if user.is_admin_rh:
            return True

        return False


class CanViewLeaveRequest(BasePermission):
    """
    Permission for viewing leave requests
    """

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        # Admin RH can view all requests
        if user.is_admin_rh:
            return True

        # Users can view their own requests
        if obj.solicitante == user:
            return True

        return False


class CanManageEvaluation(BasePermission):
    """
    Permission for managing evaluations
    """

    def has_permission(self, request, view) -> bool:
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin_rh
        )

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        # Admin RH can manage all evaluations
        if user.is_admin_rh:
            return True

        # Evaluators can manage their own evaluations
        if obj.avaliador == user:
            return True

        return False


class CanViewEvaluation(BasePermission):
    """
    Permission for viewing evaluations
    """

    def has_object_permission(self, request, view, obj) -> bool:
        user = request.user

        # Admin RH can view all evaluations
        if user.is_admin_rh:
            return True

        # Users can view evaluations where they are involved
        if obj.avaliado == user or obj.avaliador == user:
            return True

        return False


class IsOwnerOrReadOnly(BasePermission):
    """
    Permission that allows owners to edit, others to read only
    """

    def has_object_permission(self, request, view, obj) -> bool:
        # Read permissions for any request
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Write permissions only to the owner of the object
        if hasattr(obj, 'user'):
            return obj.user == request.user
        elif hasattr(obj, 'solicitante'):
            return obj.solicitante == request.user
        elif hasattr(obj, 'created_by'):
            return obj.created_by == request.user

        return False


class CanUpdateOwnProfile(BasePermission):
    """
    Permission for users to update their own profile
    """

    def has_object_permission(self, request, view, obj) -> bool:
        # Users can only update their own profile
        return obj == request.user


class IsStaffOrAdminRH(BasePermission):
    """
    Permission that only allows staff (HR/Admin) users to access non-admission endpoints.
    Regular users can only access admission process endpoints.
    """

    def has_permission(self, request, view) -> bool:
        return (
            request.user and
            request.user.is_authenticated and
            request.user.is_admin_rh
        )