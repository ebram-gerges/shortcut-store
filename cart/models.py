from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from products.models import Product, ProductColorVariant, SizeChoices, ProductStock

class CartItem(models.Model):
    """Database-driven cart item for both anonymous and authenticated users"""
    # For anonymous users, use session_key; for authenticated users, use user
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)

    # Product details
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='cart_items')
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE, null=True, blank=True)
    size = models.CharField(max_length=10, choices=SizeChoices.choices, null=True, blank=True)
    quantity = models.PositiveIntegerField(default=1, validators=[MinValueValidator(1)])

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        user_identifier = self.user.username if self.user else f"Session: {self.session_key}"
        color_size = ""
        if self.color_variant:
            color_size += f" ({self.color_variant.color}"
            if self.size:
                color_size += f", {self.size}"
            color_size += ")"
        return f"{user_identifier} - {self.product.name}{color_size} x{self.quantity}"

    def original_total_price(self):
        """Calculate original total price (before discount)"""
        return float(self.product.price) * self.quantity

    def sale_total_price(self):
        """Calculate total price after discount"""
        return self.product.discounted_price * self.quantity

    @property
    def total_price(self):
        """Calculate total price for this cart item"""
        return self.sale_total_price()

    def get_stock_item(self):
        """Get the corresponding stock item"""
        if not self.color_variant or not self.size:
            return None
        try:
            return ProductStock.objects.get(
                product=self.product,
                color_variant=self.color_variant,
                size=self.size
            )
        except ProductStock.DoesNotExist:
            return None

    def is_available(self):
        """Check if the item is still available in the requested quantity"""
        stock_item = self.get_stock_item()
        return stock_item and stock_item.available_quantity >= self.quantity
