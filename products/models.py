from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.utils import timezone


class CollectionImage(models.Model):
    """Model for storing hero section collection (gallery)"""
    title = models.CharField(max_length=200, blank=True, null=True, help_text="Descriptive title for the collection")
    # image = models.ImageField(upload_to='collections/main/', blank=True, null=True, help_text="Main image for this collection (used in hero section)")
    is_active = models.BooleanField(default=True, help_text="Enable/disable this collection")
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "Collection"
        verbose_name_plural = "Collections"

    def __str__(self):
        return f"{self.title or 'Collection'} (Order: {self.order})"


class CollectionGalleryImage(models.Model):
    collection = models.ForeignKey(CollectionImage, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='collections/gallery/', help_text="Gallery image for this collection")
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "Collection Gallery Image"
        verbose_name_plural = "Collection Gallery Images"

    def __str__(self):
        return f"{self.collection.title or 'Collection'} - Image {self.order}"


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
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, help_text="Product description")
    price = models.DecimalField(max_digits=8, decimal_places=2)
    sale_percent = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True,
        null=True,
        help_text="Admin-only field: discount percent (0-100)"
    )
    indoor_image = models.ImageField(upload_to='products/indoor/', blank=True, null=True, help_text="Indoor image for product card (main image)")
    outdoor_image = models.ImageField(upload_to='products/outdoor/', blank=True, null=True, help_text="Outdoor/hover image for product card")
    created_at = models.DateTimeField(auto_now_add=True)
    CATEGORY_CHOICES = [
        ('tshirts', 'T-Shirts'),
        ('basictop', 'Basic Tops'),
        ('shoes', 'Shoes'),
        ('sets', 'Sets'),
    ]
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, blank=True)

    @property
    def discounted_price(self):
        if self.sale_percent is not None and self.sale_percent > 0:
            return float(self.price) * (1 - float(self.sale_percent) / 100)
        return float(self.price)

    @property
    def available_colors(self):
        return self.color_variants.values_list('color', flat=True).distinct()

    @property
    def available_sizes(self):
        size_order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
        sizes = list(set(self.color_variants.values_list('size_variants__size', flat=True)))
        sizes.sort(key=lambda x: size_order.index(x) if x in size_order else 100 + ord(x[0]))
        return sizes

    @property
    def rating(self):
        try:
            from reviews.models import ProductReview
        except ImportError:
            return 0.0
        reviews = ProductReview.objects.filter(product=self)
        if not reviews.exists():
            return 0.0
        return round(sum(r.rating for r in reviews) / reviews.count(), 1)

    @property
    def review_count(self):
        try:
            from reviews.models import ProductReview
        except ImportError:
            return 0
        return ProductReview.objects.filter(product=self).count()

    def __str__(self):
        return self.name

class ProductColorVariant(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='color_variants')
    color = models.CharField(max_length=20, choices=ColorChoices.choices)
    color_hex = models.CharField(max_length=7, blank=True, help_text="Hex color code (e.g., #000000)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'color')
        ordering = ['color']

    def __str__(self):
        return f"{self.product.name} - {self.color}"

# Images now linked to color variant (not size)
class ProductColorVariantImage(models.Model):
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='color_variant_images/')
    alt_text = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.color_variant} - Image"

class ProductSizeVariant(models.Model):
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE, related_name='size_variants')
    size = models.CharField(max_length=10, choices=SizeChoices.choices)
    stock = models.PositiveIntegerField(default=0, help_text="Stock for this size under this color")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('color_variant', 'size')
        ordering = ['size']

    def __str__(self):
        return f"{self.color_variant} - {self.size}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Sync stock to ProductStock
        from .models import ProductStock  # avoid circular import
        product = self.color_variant.product
        stock_obj, created = ProductStock.objects.get_or_create(
            product=product,
            size_variant=self,
            defaults={
                'quantity': self.stock,
                'reserved_quantity': 0,
                'is_active': self.is_active
            }
        )
        if not created:
            stock_obj.quantity = self.stock
            stock_obj.is_active = self.is_active
            stock_obj.save()

# Stock is managed at the size+color level (can be merged with ProductSizeVariant, but kept for extensibility)
class ProductStock(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_items')
    size_variant = models.ForeignKey(ProductSizeVariant, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=0, help_text="Available stock quantity")
    reserved_quantity = models.PositiveIntegerField(default=0, help_text="Reserved for pending orders")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('product', 'size_variant')
        ordering = ['size_variant__color_variant__color', 'size_variant__size']

    def __str__(self):
        return f"{self.product.name} - {self.size_variant.color_variant.color} {self.size_variant.size}: {self.available_quantity}"

    @property
    def available_quantity(self):
        return max(0, self.quantity - self.reserved_quantity)

    @property
    def stock_status(self):
        available = self.available_quantity
        if available == 0:
            return 'out_of_stock'
        elif available <= 5:
            return 'low_stock'
        else:
            return 'in_stock'

    @property
    def stock_display(self):
        available = self.available_quantity
        if available == 0:
            return "Out of Stock"
        elif available <= 5:
            return f"Low Stock ({available} available)"
        else:
            return f"In Stock ({available} available)"

    def can_reserve(self, quantity):
        return self.available_quantity >= quantity

    def reserve_stock(self, quantity):
        if self.can_reserve(quantity):
            self.reserved_quantity += quantity
            self.save()
            return True
        return False

    def release_stock(self, quantity):
        self.reserved_quantity = max(0, self.reserved_quantity - quantity)
        self.save()

    def reduce_stock(self, quantity):
        if self.available_quantity >= quantity:
            self.quantity -= quantity
            self.save()
            return True
        return False

class CategoryImage(models.Model):
    CATEGORY_CHOICES = [
        ('tshirts', 'T-Shirts'),
        ('basictop', 'Basic Top'),
        ('sets', 'Suits'),
    ]
    category = models.CharField(max_length=32, choices=CATEGORY_CHOICES, unique=True)
    image = models.ImageField(upload_to='category_images/', help_text="Image for this category card")
    title = models.CharField(max_length=100, blank=True, null=True)
    description = models.CharField(max_length=200, blank=True, null=True)
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "Category Image"
        verbose_name_plural = "Category Images"

    def __str__(self):
        return f"{self.get_category_display()}"
