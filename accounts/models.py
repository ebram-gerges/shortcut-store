# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import string

class User(AbstractUser):
    fullName = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    secondary_phone = models.CharField(max_length=15, blank=True, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    address = models.TextField(blank=True, null=True)

    # Email verification fields
    email_verified = models.BooleanField(default=False)
    email_verification_code = models.CharField(max_length=6, blank=True, null=True)
    email_verification_code_created = models.DateTimeField(blank=True, null=True)

    # Override is_active to require email verification
    def save(self, *args, **kwargs):
        if not self.pk:  # New user
            self.is_active = False  # Deactivate until email verification
            self.generate_verification_code()
        super().save(*args, **kwargs)

    def generate_verification_code(self):
        """Generate a 6-digit verification code"""
        self.email_verification_code = ''.join(random.choices(string.digits, k=6))
        self.email_verification_code_created = timezone.now()

    def is_verification_code_valid(self, code):
        """Check if the verification code is valid and not expired"""
        if not self.email_verification_code or not self.email_verification_code_created:
            return False

        # Check if code matches
        if self.email_verification_code != code:
            return False

        # Check if code is not expired (15 minutes)
        expiry_time = self.email_verification_code_created + timezone.timedelta(minutes=15)
        if timezone.now() > expiry_time:
            return False

        return True

    def verify_email(self, code):
        """Verify email with the provided code"""
        if self.is_verification_code_valid(code):
            self.email_verified = True
            self.is_active = True
            self.email_verification_code = None
            self.email_verification_code_created = None
            self.save()
            return True
        return False

    def __str__(self):
        return self.email or self.username
