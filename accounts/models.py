# accounts/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import random
import string

class User(AbstractUser):
    fullName = models.CharField(max_length=255, blank=True, null=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True, blank=True, null=True)
    secondary_phone = models.CharField(max_length=15, blank=True, null=True)
    height = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    governorate = models.CharField(max_length=100, blank=True, null=True)
    avatar_color = models.CharField(max_length=7, blank=True, null=True, help_text="Hex color code for the user's avatar background, e.g., #RRGGBB.")

    # Email verification fields
    email_verified = models.BooleanField(default=False)
    email_verification_code = models.CharField(max_length=6, blank=True, null=True)
    email_verification_code_created = models.DateTimeField(blank=True, null=True)

    # Override is_active to require email verification
    # Temporarily disabled email verification
    # def save(self, *args, **kwargs):
    #     if not self.pk:  # New user
    #         if not self.is_superuser:  # Only require verification for non-superusers
    #             self.is_active = False
    #             self.generate_verification_code()
    #     super().save(*args, **kwargs)

    def generate_verification_code(self):
        """Generate and store a fresh 6-digit verification code."""
        self.email_verification_code = ''.join(random.choices(string.digits, k=6))
        self.email_verification_code_created = timezone.now()

    def is_verification_code_valid(self, code: str) -> bool:
        """Return True if `code` matches and hasn't expired (15 min)."""
        if not self.email_verification_code or not self.email_verification_code_created:
            return False

        if self.email_verification_code != code:
            return False

        expiry_time = self.email_verification_code_created + timezone.timedelta(minutes=15)
        return timezone.now() <= expiry_time

    def verify_email(self, code: str) -> bool:
        """Set user as verified if code checks out."""
        if self.is_verification_code_valid(code):
            self.email_verified = True
            self.is_active = True
            self.email_verification_code = None
            self.email_verification_code_created = None
            self.save(update_fields=[
                'email_verified', 'is_active', 'email_verification_code', 'email_verification_code_created'
            ])
            return True
        return False

    current_refresh_token = models.CharField(max_length=255, blank=True, null=True)
    orders_count = models.IntegerField(default=0)
    is_delivery_manager = models.BooleanField(default=False, help_text="If true, this user will receive order notifications and PDFs.")

    def __str__(self):
        return self.email or self.username
