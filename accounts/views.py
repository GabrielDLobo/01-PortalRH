from rest_framework import generics, status, viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import authenticate
from .models import User
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    PasswordChangeSerializer, LoginSerializer, UserProfileSerializer,
    FirstLoginPasswordChangeSerializer
)
from app.permissions import IsAdminRH, CanUpdateOwnProfile


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing users
    """
    queryset = User.objects.all()
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action"""
        if self.action == 'create':
            return UserCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        elif self.action == 'profile':
            return UserProfileSerializer
        elif self.action == 'change_password':
            return PasswordChangeSerializer
        return UserSerializer
    
    def get_permissions(self):
        """Return appropriate permissions based on action"""
        if self.action in ['create', 'list', 'destroy']:
            permission_classes = [IsAdminRH]
        elif self.action in ['retrieve', 'update', 'partial_update']:
            permission_classes = [CanUpdateOwnProfile | IsAdminRH]
        elif self.action in ['profile', 'change_password']:
            permission_classes = [permissions.IsAuthenticated]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """Filter queryset based on user role"""
        user = self.request.user
        
        if user.is_admin_rh:
            return User.objects.all()
        else:
            # Regular users can only see their own data
            return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def profile(self, request):
        """Get current user profile"""
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def change_password(self, request):
        """Change user password"""
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Senha alterada com sucesso.'
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get user statistics (Admin RH only)"""
        if not request.user.is_admin_rh:
            return Response(
                {'detail': 'Permissão negada.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        stats = {
            'total_users': User.objects.count(),
            'active_users': User.objects.filter(is_active=True).count(),
            'inactive_users': User.objects.filter(is_active=False).count(),
            'admin_rh_count': User.objects.filter(role='admin_rh').count(),
            'funcionarios_count': User.objects.filter(role='funcionario').count(),
        }
        
        return Response(stats)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom JWT token obtain view with additional user data
    """
    
    def post(self, request, *args, **kwargs):
        serializer = LoginSerializer(data=request.data, context={'request': request})
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access = refresh.access_token
            
            # User data
            user_data = UserProfileSerializer(user).data
            
            # Check if user needs to change password (first login)
            requires_password_change = False
            if hasattr(user, 'employee_profile'):
                requires_password_change = user.employee_profile.requires_password_change
            
            return Response({
                'access': str(access),
                'refresh': str(refresh),
                'user': user_data,
                'requires_password_change': requires_password_change
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RegisterView(generics.CreateAPIView):
    """
    User registration view (Admin RH only)
    """
    queryset = User.objects.all()
    serializer_class = UserCreateSerializer
    permission_classes = [IsAdminRH]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'Usuário criado com sucesso.',
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def first_login_password_change(request):
    """
    Change password for first login users
    """
    # Check if user needs to change password
    if not hasattr(request.user, 'employee_profile'):
        return Response(
            {'error': 'Usuário não possui perfil de funcionário.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    employee = request.user.employee_profile
    if not employee.requires_password_change:
        return Response(
            {'error': 'Usuário não precisa trocar a senha.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    serializer = FirstLoginPasswordChangeSerializer(
        data=request.data,
        context={'request': request}
    )
    
    if serializer.is_valid():
        # Change password
        new_password = serializer.validated_data['new_password']
        request.user.set_password(new_password)
        request.user.save()
        
        # Update employee profile
        employee.requires_password_change = False
        employee.save()
        
        return Response({
            'message': 'Senha alterada com sucesso. Você pode agora utilizar o sistema normalmente.'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def check_password_change_required(request):
    """
    Check if user needs to change password on first login
    """
    requires_password_change = False
    if hasattr(request.user, 'employee_profile'):
        requires_password_change = request.user.employee_profile.requires_password_change
    
    return Response({
        'requires_password_change': requires_password_change
    })
