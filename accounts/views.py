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
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.http import url_has_allowed_host_and_scheme

from .forms import CustomUserRegistrationForm, CustomAuthenticationForm, EmailVerificationForm
from .models import User


def register_view(request):
    """User registration view"""
    if request.user.is_authenticated:
        return redirect('landing')

    if request.method == 'POST':
        form = CustomUserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            
            # Proper login implementation
            from django.contrib.auth import login
            from django.contrib.auth import authenticate
            
            # Authenticate and login
            user = authenticate(
                username=user.email,
                password=form.cleaned_data['password1']
            )
            if user is not None:
                login(request, user)
                messages.success(request, 'Registration successful!')
                return redirect('/')
            else:
                messages.error(request, 'Auto-login failed. Please login manually.')
                return redirect('login')
    else:
        form = CustomUserRegistrationForm()

    return render(request, 'accounts/register.html', {'form': form})


def login_view(request):
    """User login view"""
    if request.user.is_authenticated:
        return redirect('landing')

    next_url = request.GET.get('next') or request.POST.get('next') or 'landing'

    if request.method == 'POST':
        form = CustomAuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            if not user.is_active:
                messages.error(request, 'Account not verified. Please check your email.')
                return redirect('login')
            login(request, user)
            # Only redirect to next if it's safe
            if url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
                return redirect(next_url)
            return redirect('landing')
        else:
            messages.error(request, 'Invalid email or password')
    else:
        form = CustomAuthenticationForm()

    return render(request, 'accounts/login.html', {'form': form, 'next': next_url})


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


def send_verification_email(user):
    """Send verification email to user with HTML template and logo"""
    subject = 'Shortcut Store - Verify Your Email Address'
    context = {
        'user': user,
        'verification_code': user.email_verification_code,
        'site_logo_url': 'http://192.168.1.4:8000/media/site-logo.svg',
    }
    message = render_to_string('emails/verification_email.html', context)
    try:
        send_mail(
            subject,
            strip_tags(message),  # fallback plain text
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=message,
            fail_silently=False,
        )
    except Exception as e:
        print(f"Failed to send verification email: {e}")
        # In production, you might want to log this error
