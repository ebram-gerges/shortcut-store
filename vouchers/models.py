from django.db import models
from django.utils import timezone
from products.models import Product, Category

class Voucher(models.Model):
    code = models.CharField(max_length=50, unique=True)
    discount_percent = models.DecimalField(max_digits=6, decimal_places=2)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)
    expiry_date = models.DateField(null=True, blank=True)
    use_once_per_user = models.BooleanField(default=False, help_text="Voucher can be used only once per user")
    require_previous_order = models.BooleanField(default=False, help_text="User must have completed at least one order")
    categories = models.ManyToManyField(
        Category,
        blank=True,
        help_text="Select categories this voucher applies to (leave empty for all categories)"
    )

    def is_valid(self, user=None, products=None):
        if not self.is_active:
            return False
        if self.expiry_date and self.expiry_date < timezone.now().date():
            return False
        if self.use_once_per_user and user:
            from orders.models import Order
            used = Order.objects.filter(user=user, voucher=self).exists()
            if used:
                return False
        if self.require_previous_order and user:
            if getattr(user, 'orders_count', 0) < 1:
                return False
        if self.categories.exists() and products:
            allowed_categories = set(self.categories.values_list('id', flat=True))
            product_cats = set([p.category.id for p in products if p.category])
            if not product_cats & allowed_categories:
                return False
        return True

    def __str__(self):
        rules = []
        if self.use_once_per_user:
            rules.append('once/user')
        if self.require_previous_order:
            rules.append('after 1 order')
        if self.categories.exists():
            cat_names = ', '.join(self.categories.values_list('name', flat=True))
            rules.append(f"cats: {cat_names}")
        return f"{self.code} ({self.discount_percent}% off) {' | '.join(rules)}"
