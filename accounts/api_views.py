from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import login
from django.core.mail import send_mail
from django.conf import settings
from .models import User
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    PasswordChangeSerializer,
    EmailVerificationSerializer
)


# -----------------------------------------------------------------------------
# Helpers
# -----------------------------------------------------------------------------


def send_verification_email(user: User) -> None:
    """Send the email-verification code to the user's email (console backend)."""
    if not user.email_verification_code:
        return

    subject = 'Verify your Shortcut Store account'
    message = (
        f"Hello {user.get_full_name() or user.username},\n\n"
        f"Thank you for registering at Shortcut Store.\n"
        f"Your verification code is: {user.email_verification_code}\n\n"
        "If you did not create an account, you can safely ignore this email."
    )
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """Register a new user"""
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        # Generate verification code and send email via console backend
        user.generate_verification_code()
        user.save(update_fields=['email_verification_code', 'email_verification_code_created'])

        send_verification_email(user)
        
        return Response({
            'message': 'User registered successfully',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(access_token),
            }
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Login user and return JWT tokens"""
    serializer = UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = refresh.access_token
        
        return Response({
            'message': 'Login successful',
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(access_token),
            }
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Get and update user profile"""
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserProfileSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """Change user password"""
    serializer = PasswordChangeSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save()
        
        return Response({
            'message': 'Password changed successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_email_view(request):
    """Verify user email with code"""
    serializer = EmailVerificationSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        user = request.user
        user.email_verified = True
        user.is_active = True
        user.email_verification_code = None
        user.email_verification_code_created = None
        user.save()
        
        return Response({
            'message': 'Email verified successfully'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resend_verification_view(request):
    """Resend email verification code"""
    user = request.user
    
    if user.email_verified:
        return Response({
            'message': 'Email is already verified'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate new verification code and email again
    user.generate_verification_code()
    user.save(update_fields=['email_verification_code', 'email_verification_code_created'])

    send_verification_email(user)
    
    return Response({
        'message': 'Verification code sent successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_detail_view(request):
    """Get current user details"""
    serializer = UserProfileSerializer(request.user)
    return Response(serializer.data)
