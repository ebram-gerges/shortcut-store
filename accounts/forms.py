# accounts/forms.py
from django import forms
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from .models import User
import re

class CustomUserRegistrationForm(UserCreationForm):
    """Custom registration form with Shortcut Store styling and validation"""
    
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email address',
            'id': 'email'
        })
    )
    
    fullName = forms.CharField(
        max_length=255,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your full name',
            'id': 'fullName'
        })
    )
    
    phone = forms.CharField(
        max_length=15,
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Primary phone number',
            'id': 'phone'
        })
    )
    
    secondary_phone = forms.CharField(
        max_length=15,
        required=False,
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'Secondary phone number (optional)',
            'id': 'secondary_phone'
        })
    )
    
    address = forms.CharField(
        required=True,
        widget=forms.Textarea(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your complete address',
            'id': 'address',
            'rows': 3
        })
    )
    
    password1 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Create a strong password',
            'id': 'password1'
        })
    )
    
    password2 = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Confirm your password',
            'id': 'password2'
        })
    )
    
    class Meta:
        model = User
        fields = ('email', 'fullName', 'phone', 'secondary_phone', 'address', 'password1', 'password2')
    
    def clean_email(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError("An account with this email already exists.")
        return email
    
    def clean_phone(self):
        phone = self.cleaned_data.get('phone')
        # Basic phone validation
        if not re.match(r'^\+?[\d\s\-\(\)]{10,15}$', phone):
            raise ValidationError("Please enter a valid phone number.")
        if User.objects.filter(phone=phone).exists():
            raise ValidationError("An account with this phone number already exists.")
        return phone
    
    def clean_password1(self):
        password1 = self.cleaned_data.get('password1')
        if len(password1) < 8:
            raise ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Za-z]', password1):
            raise ValidationError("Password must contain at least one letter.")
        if not re.search(r'\d', password1):
            raise ValidationError("Password must contain at least one number.")
        return password1
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.username = self.cleaned_data['email']  # Use email as username
        if commit:
            user.save()
        return user


class CustomAuthenticationForm(AuthenticationForm):
    """Custom login form with email authentication"""
    
    username = forms.EmailField(
        widget=forms.EmailInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your email address',
            'id': 'email',
            'autofocus': True
        })
    )
    
    password = forms.CharField(
        widget=forms.PasswordInput(attrs={
            'class': 'form-control',
            'placeholder': 'Enter your password',
            'id': 'password'
        })
    )
    
    def clean(self):
        email = self.cleaned_data.get('username')
        password = self.cleaned_data.get('password')
        
        if email and password:
            # Try to authenticate with email
            try:
                user = User.objects.get(email=email)
                self.user_cache = authenticate(
                    self.request, 
                    username=user.username, 
                    password=password
                )
                if self.user_cache is None:
                    raise ValidationError("Invalid email or password.")
                elif not self.user_cache.is_active:
                    if not self.user_cache.email_verified:
                        raise ValidationError("Please verify your email address before logging in.")
                    else:
                        raise ValidationError("This account is inactive.")
            except User.DoesNotExist:
                raise ValidationError("Invalid email or password.")
        
        return self.cleaned_data


class EmailVerificationForm(forms.Form):
    """Form for email verification code"""
    
    verification_code = forms.CharField(
        max_length=6,
        min_length=6,
        widget=forms.TextInput(attrs={
            'class': 'form-control verification-input',
            'placeholder': '000000',
            'id': 'verification_code',
            'maxlength': '6',
            'pattern': '[0-9]{6}',
            'autocomplete': 'off'
        })
    )
    
    def clean_verification_code(self):
        code = self.cleaned_data.get('verification_code')
        if not code.isdigit():
            raise ValidationError("Verification code must be 6 digits.")
        return code
