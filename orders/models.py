from django.db import models
from django.contrib.auth import get_user_model
from products.models import Product
from vouchers.models import Voucher

User = get_user_model()

class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('processing', 'Processing'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]

    PAYMENT_CHOICES = [
        ('cod', 'Cash on Delivery'),
        ('card', 'Credit/Debit Card'),
        ('wallet', 'Mobile Wallet'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Order details
    order_number = models.CharField(max_length=20, unique=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')

    # Pricing
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    voucher = models.ForeignKey(Voucher, on_delete=models.SET_NULL, null=True, blank=True)

    # Shipping information
    shipping_first_name = models.CharField(max_length=100)
    shipping_last_name = models.CharField(max_length=100)
    shipping_email = models.EmailField()
    shipping_phone = models.CharField(max_length=20)
    shipping_address = models.TextField()
    shipping_city = models.CharField(max_length=100)
    shipping_governorate = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20, blank=True)

    # Payment information
    payment_method = models.CharField(max_length=20, choices=PAYMENT_CHOICES, default='cod')
    payment_status = models.CharField(max_length=20, default='pending')

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            # Generate order number
            import random
            import string
            self.order_number = 'SC' + ''.join(random.choices(string.digits, k=8))
        super().save(*args, **kwargs)

    @property
    def full_shipping_name(self):
        return f"{self.shipping_first_name} {self.shipping_last_name}"

    def __str__(self):
        return f"Order #{self.order_number}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    color_variant = models.ForeignKey('products.ProductColorVariant', on_delete=models.SET_NULL, null=True, blank=True)
    size = models.CharField(max_length=10, blank=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)  # price per item
    total_price = models.DecimalField(max_digits=10, decimal_places=2)  # total for that item

    def save(self, *args, **kwargs):
        if not self.total_price:
            self.total_price = self.unit_price * self.quantity
        super().save(*args, **kwargs)

    def __str__(self):
        variant_info = ""
        if self.color_variant:
            variant_info += f" ({self.color_variant.color}"
            if self.size:
                variant_info += f", {self.size}"
            variant_info += ")"
        return f"{self.product.name}{variant_info} x{self.quantity}"
