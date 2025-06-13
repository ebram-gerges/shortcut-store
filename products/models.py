from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.utils import timezone

class SizeChoices(models.TextChoices):
    XS = 'XS', _('Extra Small')
    S = 'S', _('Small')
    M = 'M', _('Medium')
    L = 'L', _('Large')
    XL = 'XL', _('Extra Large')
    XXL = 'XXL', _('2X Large')

class ColorChoices(models.TextChoices):
    BLACK = 'Black', _('Black')
    WHITE = 'White', _('White')
    RED = 'Red', _('Red')
    BLUE = 'Blue', _('Blue')
    GREEN = 'Green', _('Green')
    YELLOW = 'Yellow', _('Yellow')
    NAVY = 'Navy', _('Navy')
    GREY = 'Grey', _('Grey')
    BROWN = 'Brown', _('Brown')
    BURGUNDY = 'Burgundy', _('Burgundy')
    VIOLET = 'Violet', _('Violet')
    OLIVE = 'Olive', _('Olive')
    IRON_GREY = 'Iron Grey', _('Iron Grey')
    SIERRA_BLUE = 'Sierra Blue', _('Sierra Blue')
    CARBON_GREY = 'Carbon Grey', _('Carbon Grey')
    OTHER = 'Other', _('Other')

class Product(models.Model):
    # Use Django's default id as the product ID
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, help_text="Product description")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    sale_percent = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True,
        null=True,
        help_text="Admin-only field: discount percent (0-100)"
    )
    stock = models.PositiveIntegerField(default=0, help_text="Number of products in stock")
    image = models.ImageField(upload_to='products/', blank=True, null=True, help_text="Main product image")
    created_at = models.DateTimeField(auto_now_add=True)
    CATEGORY_CHOICES = [
        ('tshirts', 'T-Shirts'),
        ('basictop', 'Basic Top'),
        ('shoes', 'Shoes'),
        ('bottoms', 'Bottoms'),
        ('sets', 'Sets'),
        ('shorts', 'Shorts'),
        ('sweatpants', 'Sweatpants'),
    ]
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, default='tshirts')

    @property
    def discounted_price(self):
        """Calculate price after discount if applicable and return as float"""
        if self.sale_percent is not None and self.sale_percent > 0:
            return float(self.price) * (1 - float(self.sale_percent) / 100)
        return float(self.price)

    @property
    def available_colors(self):
        """Get all available colors for this product"""
        return self.color_variants.values_list('color', flat=True).distinct()

    @property
    def available_sizes(self):
        """Get all available sizes for this product"""
        return self.variants.values_list('size', flat=True).distinct()

    @property
    def get_first_image(self):
        """Get the first available image for this product"""
        # Try to get primary image from first color variant
        first_variant = self.color_variants.filter(is_active=True).first()
        if first_variant:
            primary_image = first_variant.images.filter(is_primary=True).first()
            if primary_image:
                return primary_image
            # If no primary image, get first image from variant
            first_variant_image = first_variant.images.first()
            if first_variant_image:
                return first_variant_image

        # Fallback to main product image if no variant images
        if self.image:
            return type('obj', (object,), {'image': self.image, 'alt_text': self.name})()

        return None

    @property
    def is_on_sale(self):
        """Check if product is on sale"""
        return self.sale_percent is not None and self.sale_percent > 0

    @property
    def discount_percentage(self):
        """Get discount percentage"""
        return self.sale_percent if self.sale_percent else 0

    @property
    def total_stock(self):
        """Get total available stock across all variants"""
        return sum(item.available_quantity for item in self.stock_items.all())

    def __str__(self):
        return self.name

class ProductColorVariant(models.Model):
    """Represents a color variant of a product"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='color_variants')
    color = models.CharField(max_length=20, choices=ColorChoices.choices)
    color_hex = models.CharField(max_length=7, blank=True, help_text="Hex color code (e.g., #000000)")
    stock = models.PositiveIntegerField(default=0, help_text="Stock for this color variant")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'color')
        ordering = ['color']

    def __str__(self):
        return f"{self.product.name} - {self.color}"

class ProductColorVariantImage(models.Model):
    """Multiple images for each color variant"""
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='color_variants/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False, help_text="Primary image for this color variant")
    order = models.PositiveIntegerField(default=0, help_text="Display order")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.color_variant} - Image {self.order}"

    def save(self, *args, **kwargs):
        # If this is set as primary, unset other primary images for this color variant
        if self.is_primary:
            ProductColorVariantImage.objects.filter(
                color_variant=self.color_variant,
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

class ProductVariant(models.Model):
    """Represents size variants for products"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='variants')
    size = models.CharField(max_length=10, choices=SizeChoices.choices)
    stock = models.PositiveIntegerField(default=0, help_text="Stock for this size")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'size')
        ordering = ['size']

    def __str__(self):
        return f"{self.product.name} - {self.size}"

class ProductStock(models.Model):
    """Represents stock for specific color-size combinations"""
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_items')
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE)
    size = models.CharField(max_length=10, choices=SizeChoices.choices)
    quantity = models.PositiveIntegerField(default=0, help_text="Available stock quantity")
    reserved_quantity = models.PositiveIntegerField(default=0, help_text="Reserved for pending orders")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'color_variant', 'size')
        ordering = ['color_variant__color', 'size']

    def __str__(self):
        return f"{self.product.name} - {self.color_variant.color} {self.size}: {self.available_quantity}"

    @property
    def available_quantity(self):
        """Returns the actual available quantity (total - reserved)"""
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def stock_status(self):
        """Returns stock status: 'in_stock', 'low_stock', or 'out_of_stock'"""
        available = self.available_quantity
        if available == 0:
            return 'out_of_stock'
        elif available <= 5:
            return 'low_stock'
        else:
            return 'in_stock'

    @property
    def stock_display(self):
        """Returns formatted stock display text"""
        available = self.available_quantity
        if available == 0:
            return "Out of Stock"
        elif available <= 5:
            return f"Low Stock ({available} available)"
        else:
            return f"In Stock ({available} available)"

    def can_reserve(self, quantity):
        """Check if we can reserve the specified quantity"""
        return self.available_quantity >= quantity

    def reserve_stock(self, quantity):
        """Reserve stock for an order"""
        if self.can_reserve(quantity):
            self.reserved_quantity += quantity
            self.save()
            return True
        return False

    def release_stock(self, quantity):
        """Release reserved stock"""
        self.reserved_quantity = max(0, self.reserved_quantity - quantity)
        self.save()

    def reduce_stock(self, quantity):
        """Reduce actual stock quantity (when order is completed)"""
        if self.quantity >= quantity:
            self.quantity -= quantity
            self.reserved_quantity = max(0, self.reserved_quantity - quantity)
            self.save()
            return True
        return False
