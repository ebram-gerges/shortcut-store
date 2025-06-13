from django.db import models
from django.utils import timezone

class Voucher(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.DecimalField(max_digits=6, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    def is_valid(self):
        return self.expiry_date >= timezone.now().date()
    def __str__(self):
        return f"{self.code} ({self.discount_percent}% off)"
