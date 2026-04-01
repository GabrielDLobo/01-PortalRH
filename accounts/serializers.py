from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """
    User serializer for general user information
    """
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for user creation
    """
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'role'
        ]
    
    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'As senhas não coincidem.'
            })
        return attrs
    
    def create(self, validated_data):
        """Create user with hashed password"""
        validated_data.pop('password_confirm', None)
        password = validated_data.pop('password')
        
        user = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for user updates
    """
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name', 'role'
        ]


class PasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for password changes
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Validate password change"""
        user = self.context['request'].user
        
        # Check old password
        if not user.check_password(attrs['old_password']):
            raise serializers.ValidationError({
                'old_password': 'Senha atual incorreta.'
            })
        
        # Check new password confirmation
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'As senhas não coincidem.'
            })
        
        return attrs
    
    def save(self):
        """Save new password"""
        user = self.context['request'].user
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user


class LoginSerializer(serializers.Serializer):
    """
    Serializer for user login
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(
                request=self.context.get('request'),
                username=email,
                password=password
            )
            
            if not user:
                raise serializers.ValidationError({
                    'non_field_errors': ['Email ou senha inválidos.']
                })
            
            if not user.is_active:
                raise serializers.ValidationError({
                    'non_field_errors': ['Conta desativada.']
                })
            
            attrs['user'] = user
            return attrs
        
        raise serializers.ValidationError({
            'non_field_errors': ['Email e senha são obrigatórios.']
        })


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for user profile with additional information
    """
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'full_name', 'role', 'role_display', 'is_active',
            'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'full_name', 'role_display', 'last_login',
            'created_at', 'updated_at'
        ]


class FirstLoginPasswordChangeSerializer(serializers.Serializer):
    """
    Serializer for first login password change (doesn't require old password)
    """
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(required=True)
    
    def validate(self, attrs):
        """Validate password change for first login"""
        user = self.context['request'].user
        
        # Check if user actually needs to change password
        if hasattr(user, 'employee_profile'):
            if not user.employee_profile.requires_password_change:
                raise serializers.ValidationError({
                    'non_field_errors': ['Usuário não precisa trocar a senha.']
                })
        else:
            raise serializers.ValidationError({
                'non_field_errors': ['Usuário não possui perfil de funcionário.']
            })
        
        # Check new password confirmation
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError({
                'new_password_confirm': 'As senhas não coincidem.'
            })
        
        return attrs
