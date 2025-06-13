from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.mail import send_mail
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
import json

from .forms import CustomUserRegistrationForm, CustomAuthenticationForm, EmailVerificationForm, PasswordResetForm, PasswordResetConfirmForm
from .models import User


def register_view(request):
    """User registration view"""
    if request.user.is_authenticated:
        return redirect('landing')

    if request.method == 'POST':
        form = CustomUserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Send verification email
            send_verification_email(user)
            messages.success(request, 'Registration successful! Please check your email for verification code.')
            return redirect('accounts:verify_email', user_id=user.id)
    else:
        form = CustomUserRegistrationForm()

    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    """User login view"""
    if request.user.is_authenticated:
        return redirect('landing')

    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            # Redirect to next page or landing page
            next_url = request.GET.get('next', 'landing')
            messages.success(request, f'Welcome back, {user.fullName or user.email}!')
            return redirect(next_url)
    else:
        form = CustomAuthenticationForm()

    return render(request, 'accounts/login.html', {'form': form})


def verify_email_view(request, user_id=None):
    """Email verification view"""
    if request.user.is_authenticated:
        return redirect('landing')

    # Get user from URL parameter or session
    if user_id:
        user = get_object_or_404(User, id=user_id)
    else:
        user_id = request.session.get('verification_user_id')
        if not user_id:
            messages.error(request, 'Verification session expired. Please register again.')
            return redirect('accounts:register')
        user = get_object_or_404(User, id=user_id)

    # Store user ID in session for resend functionality
    request.session['verification_user_id'] = user.id

    if request.method == 'POST':
        form = EmailVerificationForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['verification_code']
            if user.verify_email(code):
                login(request, user)
                messages.success(request, 'Email verified successfully! Welcome to Shortcut Store!')
                return redirect('landing')
            else:
                messages.error(request, 'Invalid or expired verification code. Please try again.')
    else:
        form = EmailVerificationForm()

    return render(request, 'accounts/verify_email.html', {
        'form': form,
        'user': user
    })


@require_http_methods(["POST"])
def resend_verification_code(request):
    """AJAX endpoint to resend verification code"""
    user_id = request.session.get('verification_user_id')
    if not user_id:
        return JsonResponse({'error': 'No verification session found'}, status=400)

    try:
        user = User.objects.get(id=user_id)
        user.generate_verification_code()
        user.save()
        send_verification_email(user)
        return JsonResponse({'success': True, 'message': 'Verification code sent successfully!'})
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': 'Failed to send verification code'}, status=500)


def logout_view(request):
    """User logout view"""
    logout(request)
    messages.success(request, 'You have been logged out successfully.')
    return redirect('landing')


@login_required
def profile_view(request):
    """Basic user profile view"""
    return render(request, 'accounts/profile.html', {'user': request.user})


def password_reset_view(request):
    """Password reset request view"""
    if request.user.is_authenticated:
        return redirect('landing')

    if request.method == 'POST':
        form = PasswordResetForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            try:
                user = User.objects.get(email=email)
                user.generate_verification_code()  # Reuse verification code for password reset
                user.save()
                send_password_reset_email(user)
                messages.success(request, 'Password reset code sent to your email.')
                return redirect('accounts:password_reset_confirm', user_id=user.id)
            except User.DoesNotExist:
                messages.error(request, 'No account found with this email address.')
    else:
        form = PasswordResetForm()

    return render(request, 'accounts/password_reset.html', {'form': form})


def password_reset_confirm_view(request, user_id=None):
    """Password reset confirmation view"""
    if request.user.is_authenticated:
        return redirect('landing')

    # Get user from URL parameter or session
    if user_id:
        user = get_object_or_404(User, id=user_id)
    else:
        user_id = request.session.get('reset_user_id')
        if not user_id:
            messages.error(request, 'Password reset session expired. Please try again.')
            return redirect('accounts:password_reset')
        user = get_object_or_404(User, id=user_id)

    # Store user ID in session
    request.session['reset_user_id'] = user.id

    if request.method == 'POST':
        form = PasswordResetConfirmForm(request.POST)
        if form.is_valid():
            code = form.cleaned_data['verification_code']
            new_password = form.cleaned_data['new_password1']

            if user.is_verification_code_valid(code):
                user.set_password(new_password)
                user.email_verification_code = None
                user.email_verification_code_created = None
                user.save()
                messages.success(request, 'Password reset successfully! You can now log in with your new password.')
                return redirect('accounts:login')
            else:
                messages.error(request, 'Invalid or expired verification code. Please try again.')
    else:
        form = PasswordResetConfirmForm()

    return render(request, 'accounts/password_reset_confirm.html', {
        'form': form,
        'user': user
    })


def send_verification_email(user):
    """Send verification email to user"""
    subject = 'Shortcut Store - Verify Your Email Address'
    message = f"""
    Welcome to Shortcut Store!

    Your verification code is: {user.email_verification_code}

    This code will expire in 15 minutes.

    If you didn't create an account with Shortcut Store, please ignore this email.

    Best regards,
    Shortcut Store Team
    """

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # In production, you might want to log this error


def send_password_reset_email(user):
    """Send password reset email to user"""
    subject = 'Shortcut Store - Password Reset Request'
    message = f"""
    Hello {user.fullName or user.email},

    You have requested to reset your password for your Shortcut Store account.

    Your password reset code is: {user.email_verification_code}

    This code will expire in 15 minutes.

    If you didn't request a password reset, please ignore this email and your password will remain unchanged.

    Best regards,
    Shortcut Store Team
    """

    try:
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Failed to send password reset email: {e}")
        # In production, you might want to log this error
