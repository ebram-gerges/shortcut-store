from .models import Voucher
from django.utils import timezone
from decimal import Decimal

def apply_voucher(user, code, total_price):
    try:
        voucher = Voucher.objects.get(code__iexact=code, is_active=True)
        if voucher.expiry_date and voucher.expiry_date < timezone.now().date():
            return total_price, None  # Voucher expired
        discount = (voucher.discount_percent / Decimal(100)) * total_price
        return total_price - discount, voucher
    except Voucher.DoesNotExist:
        return total_price, None
