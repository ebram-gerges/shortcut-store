from django.db import models
from django.conf import settings
from products.models import Product

class WishlistItem(models.Model):
    """Database-driven wishlist item for both anonymous and authenticated users"""
    # For anonymous users, use session_key; for authenticated users, use user
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, blank=True)
    session_key = models.CharField(max_length=40, null=True, blank=True)

    # Product details
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='wishlist_items')

    # Timestamps
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-added_at']

    def __str__(self):
        user_identifier = self.user.username if self.user else f"Session: {self.session_key}"
        return f"{self.product.name} in {user_identifier}'s wishlist"
