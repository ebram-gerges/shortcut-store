from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed
from django.db import IntegrityError
from django.core.exceptions import ValidationError as DjangoValidationError


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        password = attrs.get('password')

        user = authenticate(username=username_or_email, password=password)

        if not user and '@' in username_or_email:
            try:
                user_by_email = User.objects.get(email=username_or_email)
                user = authenticate(username=user_by_email.username, password=password)
            except User.DoesNotExist:
                pass

        if user and user.is_active:
            self.user = user
            data = super().validate(attrs)
            refresh = self.get_token(self.user)
            data['refresh'] = str(refresh)
            data['access'] = str(refresh.access_token)
            return data
        
        raise AuthenticationFailed(
            self.error_messages['no_active_account'],
            'no_active_account',
        )


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True)
    phone = serializers.CharField(required=True)
    secondary_phone = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    height = serializers.DecimalField(max_digits=5, decimal_places=2, required=True)
    weight = serializers.DecimalField(max_digits=5, decimal_places=2, required=True)
    address = serializers.CharField(required=True)
    city = serializers.CharField(required=True)
    governorate = serializers.CharField(required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'password', 'password_confirm',
            'phone', 'secondary_phone', 'height', 'weight', 'address', 'city', 'governorate'
        ]
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
        }
    
    def validate_phone(self, value):
        """Format phone number to +20 format"""
        # Remove any existing country code or + symbol
        clean_phone = value.replace('+', '').replace('20', '')
        
        # Remove leading 0 if present
        if clean_phone.startswith('0'):
            clean_phone = clean_phone[1:]
        
        # Add +20 prefix
        return f"+20{clean_phone}"
    
    def validate_secondary_phone(self, value):
        """Format secondary phone number to +20 format if provided"""
        if not value:
            return value
        
        # Remove any existing country code or + symbol
        clean_phone = value.replace('+', '').replace('20', '')
        
        # Remove leading 0 if present
        if clean_phone.startswith('0'):
            clean_phone = clean_phone[1:]
        
        # Add +20 prefix
        return f"+20{clean_phone}"
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        # Check for unique email
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({'email': 'An account with this email already exists.'})
        # Check for unique phone
        if User.objects.filter(phone=attrs['phone']).exists():
            raise serializers.ValidationError({'phone': 'An account with this phone number already exists.'})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        try:
            user = User.objects.create_user(**validated_data)
        except IntegrityError as e:
            if 'email' in str(e):
                raise serializers.ValidationError({'email': 'An account with this email already exists.'})
            if 'phone' in str(e):
                raise serializers.ValidationError({'phone': 'An account with this phone number already exists.'})
            raise serializers.ValidationError('Registration failed. Please try again.')
        except DjangoValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return user


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            if not user:
                # Try with email
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError({'non_field_errors': 'Invalid email/username or password.'})
            
            if not user.is_active:
                raise serializers.ValidationError({'non_field_errors': 'User account is disabled or not verified.'})
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError({'non_field_errors': 'Must include username and password.'})


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'fullName', 'phone', 'secondary_phone', 'height', 'weight', 
            'address', 'city', 'governorate', 'avatar_color', 'email_verified', 'date_joined'
        ]
        read_only_fields = ['id', 'username', 'email', 'email_verified', 'date_joined']
    
    def to_representation(self, instance):
        """Format phone numbers in the response"""
        data = super().to_representation(instance)
        
        # Format phone numbers to +20 format
        if data.get('phone'):
            clean_phone = data['phone'].replace('+', '').replace('20', '')
            if clean_phone.startswith('0'):
                clean_phone = clean_phone[1:]
            data['phone'] = f"+20{clean_phone}"
        
        if data.get('secondary_phone'):
            clean_phone = data['secondary_phone'].replace('+', '').replace('20', '')
            if clean_phone.startswith('0'):
                clean_phone = clean_phone[1:]
            data['secondary_phone'] = f"+20{clean_phone}"
        
        return data


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'fullName', 'phone', 
            'secondary_phone', 'height', 'weight', 'address', 'city', 'governorate'
        ]
    
    def validate_phone(self, value):
        """Format phone number to +20 format"""
        # Remove any existing country code or + symbol
        clean_phone = value.replace('+', '').replace('20', '')
        
        # Remove leading 0 if present
        if clean_phone.startswith('0'):
            clean_phone = clean_phone[1:]
        
        # Add +20 prefix
        return f"+20{clean_phone}"
    
    def validate_secondary_phone(self, value):
        """Format secondary phone number to +20 format if provided"""
        if not value:
            return value
        
        # Remove any existing country code or + symbol
        clean_phone = value.replace('+', '').replace('20', '')
        
        # Remove leading 0 if present
        if clean_phone.startswith('0'):
            clean_phone = clean_phone[1:]
        
        # Add +20 prefix
        return f"+20{clean_phone}"


class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords don't match")
        return attrs
    
    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect")
        return value


class EmailVerificationSerializer(serializers.Serializer):
    code = serializers.CharField(max_length=6)
    
    def validate_code(self, value):
        user = self.context['request'].user
        if not user.email_verification_code or user.email_verification_code != value:
            raise serializers.ValidationError("Invalid verification code")
        
        # Check if code is expired (24 hours)
        from django.utils import timezone
        from datetime import timedelta
        if user.email_verification_code_created:
            if timezone.now() - user.email_verification_code_created > timedelta(hours=24):
                raise serializers.ValidationError("Verification code has expired")
        
        return value
