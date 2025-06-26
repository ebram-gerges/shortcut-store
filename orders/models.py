from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product
from vouchers.models import Voucher
import uuid
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

User = get_user_model()

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    serial = models.CharField(max_length=32, unique=True, blank=True, null=True)
    
    # Shipping information
    shipping_first_name = models.CharField(max_length=100, blank=True)
    shipping_last_name = models.CharField(max_length=100, blank=True)
    shipping_email = models.EmailField(blank=True)
    shipping_address = models.TextField(blank=True)
    shipping_city = models.CharField(max_length=100, blank=True)
    shipping_governorate = models.CharField(max_length=100, blank=True)
    shipping_phone = models.CharField(max_length=20, blank=True)

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        old_status = None
        if not is_new:
            try:
                old_status = Order.objects.get(pk=self.pk).status
            except Order.DoesNotExist:
                pass

        if not self.serial:
            self.serial = uuid.uuid4().hex[:12].upper()
        
        super().save(*args, **kwargs)

        if not is_new and old_status != self.status:
            subject = f'Your Order #{self.serial} has been updated!'
            message = render_to_string('emails/order_status_update.html', {
                'order': self,
                'user': self.user
            })
            send_mail(
                subject,
                strip_tags(message),
                'no-reply@shortcut-store.com',
                [self.user.email],
                html_message=message
            )

    def __str__(self):
        return f"Order #{self.id} ({self.serial})"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # total for that item
    color = models.CharField(max_length=20, blank=True, null=True)
    size = models.CharField(max_length=10, blank=True, null=True)

    def __str__(self):
        return f"{self.product.name} x{self.quantity} ({self.color or ''} {self.size or ''})"
