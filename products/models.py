from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth.models import User
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericRelation
from .utils import process_image_variants
from django.db.models import JSONField
from django.core.exceptions import ValidationError


class Category(models.Model):
    """Model for product categories"""
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    description = models.TextField(blank=True, help_text="Category description")
    image = models.ImageField(upload_to='categories/', blank=True, null=True, help_text="Category image")
    image_variants = JSONField(blank=True, null=True, default=dict, help_text="Auto-generated image variants (WebP/AVIF, multiple sizes)")
    is_active = models.BooleanField(default=True, help_text="Enable/disable this category")
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_one_size = models.BooleanField(default=False, help_text="Check if this category is for one-size products only")

    class Meta:
        ordering = ['order', 'name']
        verbose_name = "Category"
        verbose_name_plural = "Categories"
        indexes = [
            models.Index(fields=['name', 'is_active']),
            models.Index(fields=['slug', 'is_active']),
        ]

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
        if self.image:
            self.image_variants = process_image_variants(self.image, instance=self)
            super().save(update_fields=["image_variants"])  # Save only the variants

    @property
    def product_count(self):
        return self.products.count()

class CollectionImage(models.Model):
    """Model for storing hero section collection (gallery)"""
    title = models.CharField(max_length=200, blank=True, null=True, help_text="Descriptive title for the collection")
    image = models.ImageField(upload_to='collections/main/', blank=True, null=True, help_text="Main image for this collection (used in hero section)")
    image_variants = JSONField(blank=True, null=True, default=dict, help_text="Auto-generated image variants (WebP/AVIF, multiple sizes)")
    is_active = models.BooleanField(default=True, help_text="Enable/disable this collection")
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "Collection"
        verbose_name_plural = "Collections"

    def __str__(self):
        return f"{self.title or 'Collection'} (Order: {self.order})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            self.image_variants = process_image_variants(self.image, instance=self)
            super().save(update_fields=["image_variants"])  # Save only the variants


class CollectionGalleryImage(models.Model):
    collection = models.ForeignKey(CollectionImage, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='collections/gallery/', help_text="Gallery image for this collection")
    image_variants = JSONField(blank=True, null=True, default=dict, help_text="Auto-generated image variants (WebP/AVIF, multiple sizes)")
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = "Collection Gallery Image"
        verbose_name_plural = "Collection Gallery Images"

    def __str__(self):
        return f"{self.collection.title or 'Collection'} - Image {self.order}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            self.image_variants = process_image_variants(self.image, instance=self)
            super().save(update_fields=["image_variants"])  # Save only the variants


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

class SubCategory(models.Model):
    name = models.CharField(max_length=100, unique=True, db_index=True)
    slug = models.SlugField(max_length=100, unique=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='subcategories')
    description = models.TextField(blank=True, help_text="Subcategory description")
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0, help_text="Display order (lower numbers appear first)")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'name']
        verbose_name = "SubCategory"
        verbose_name_plural = "SubCategories"

    def __str__(self):
        return f"{self.name} ({self.category.name})"

class Product(models.Model):
    name = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(max_length=220, unique=True, db_index=True, blank=True)
    description = models.TextField(blank=True, help_text="Product description")
    price = models.DecimalField(max_digits=8, decimal_places=2, db_index=True)
    sale_percent = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        blank=True,
        null=True,
        help_text="Admin-only field: discount percent (0-100)",
        db_index=True
    )
    indoor_image = models.ImageField(upload_to='products/indoor/', blank=True, null=True, help_text="Indoor image for product card (main image)")
    indoor_image_variants = JSONField(blank=True, null=True, default=dict, help_text="Auto-generated image variants (WebP/AVIF, multiple sizes)")
    outdoor_image = models.ImageField(upload_to='products/outdoor/', blank=True, null=True, help_text="Outdoor/hover image for product card")
    outdoor_image_variants = JSONField(blank=True, null=True, default=dict, help_text="Auto-generated image variants (WebP/AVIF, multiple sizes)")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='products', db_index=True)
    subcategory = models.ForeignKey('SubCategory', on_delete=models.SET_NULL, null=True, blank=True, related_name='products')
    # Remove custom manager from Product
    # Use default manager

    class Meta:
        indexes = [
            models.Index(fields=['category', 'sale_percent']),
            models.Index(fields=['price', 'created_at']),
            models.Index(fields=['category', 'price']),
            models.Index(fields=['name', 'category']),
            models.Index(fields=['slug']),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            from django.utils.text import slugify
            base_slug = slugify(self.name)
            slug = base_slug
            n = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{n}"
                n += 1
            self.slug = slug
        super().save(*args, **kwargs)
        updated = False
        if self.indoor_image:
            self.indoor_image_variants = process_image_variants(self.indoor_image, instance=self)
            updated = True
        if self.outdoor_image:
            self.outdoor_image_variants = process_image_variants(self.outdoor_image, instance=self)
            updated = True
        if updated:
            super().save(update_fields=["indoor_image_variants", "outdoor_image_variants"])

    def clean(self):
        if self.category is None:
            raise ValidationError({'category': 'Category is required for all products.'})

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
        sizes = [s for s in sizes if s is not None]
        if not sizes:
            return []
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
    color = models.CharField(max_length=30)  # Allow any color name
    color_hex = models.CharField(max_length=7, blank=True, help_text="Hex color code (e.g., #000000)")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('product', 'color')
        ordering = ['created_at']

    def __str__(self):
        return f"{self.product.name} - {self.color}"

# Images now linked to color variant (not size)
class ProductColorVariantImage(models.Model):
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='color_variant_images/')
    image_variants = JSONField(blank=True, null=True, default=dict, help_text="Auto-generated image variants (WebP/AVIF, multiple sizes)")
    alt_text = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.color_variant} - Image"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.image:
            self.image_variants = process_image_variants(self.image, instance=self)
            super().save(update_fields=["image_variants"])  # Save only the variants

def is_one_size_category(category, subcategory=None):
    """Helper to check if a category or subcategory is a one-size category (sweatpants, suits, basic tops)"""
    targets = [getattr(category, 'name', None), getattr(category, 'slug', None)]
    if subcategory:
        targets += [getattr(subcategory, 'name', None), getattr(subcategory, 'slug', None)]
    targets = [s.lower() for s in targets if s]
    return any(
        'sweatpant' in s or 'suit' in s or 'basic top' in s
        for s in targets
    )

class ProductSizeVariant(models.Model):
    color_variant = models.ForeignKey(ProductColorVariant, on_delete=models.CASCADE, related_name='size_variants')
    size = models.CharField(max_length=10, choices=SizeChoices.choices)
    stock = models.PositiveIntegerField(default=0, help_text="Stock for this size under this color")
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('color_variant', 'size')
        ordering = ['size']

    def clean(self):
        # Enforce only one size per color variant for one-size categories
        product = self.color_variant.product
        if is_one_size_category(product.category, product.subcategory):
            existing = ProductSizeVariant.objects.filter(color_variant=self.color_variant).exclude(pk=self.pk)
            if existing.exists():
                raise ValidationError("Only one size is allowed per color variant for this category or subcategory.")
        super().clean()

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

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

class Question(models.Model):
    username = models.CharField(max_length=150)
    email = models.EmailField()
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='questions')
    question = models.TextField()
    date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Question by {self.username} on {self.product.name} at {self.date.strftime('%Y-%m-%d %H:%M')}"

class SiteAnnouncement(models.Model):
    message = models.CharField(max_length=255)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Site Announcement'
        verbose_name_plural = 'Site Announcements'

    def __str__(self):
        return self.message

class OneSizeProductManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(category__is_one_size=True)

class OneSizeProduct(Product):
    objects = OneSizeProductManager()
    def __str__(self):
        return f"1 sized({self.name})"
    class Meta:
        proxy = True
        verbose_name = "One Size Product"
        verbose_name_plural = "One Size Products"

class MultiSizeProductManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(
            models.Q(category__is_one_size=False) | models.Q(category__is_one_size__isnull=True)
        )

class MultiSizeProduct(Product):
    objects = MultiSizeProductManager()
    class Meta:
        proxy = True
        verbose_name = "Multi Size Product"
        verbose_name_plural = "Multi Size Products"
