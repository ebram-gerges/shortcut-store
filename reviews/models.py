from django.db import models
from django.conf import settings
from products.models import Product

class ProductReview(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)], db_index=True)  # 1 to 5 stars
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        unique_together = ['user', 'product']  # One review per user per product
        indexes = [
            models.Index(fields=['product', 'rating']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"{self.rating}★ by {self.user} on {self.product.name}"

class WebsiteReview(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)], db_index=True)  # 1 to 5 stars
    comment = models.TextField()
    experience_rating = models.PositiveSmallIntegerField(choices=[(i, str(i)) for i in range(1, 6)], db_index=True)  # Overall experience
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['rating', 'created_at']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        return f"Website review by {self.user} - {self.rating}★"

class ProductPhoto(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='user_photos', db_index=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, db_index=True)
    photo = models.ImageField(upload_to='product_photos/')
    caption = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    is_approved = models.BooleanField(default=False, db_index=True)  # For moderation
    review = models.OneToOneField(ProductReview, on_delete=models.CASCADE, null=True, blank=True, related_name='photo')

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product', 'is_approved']),
            models.Index(fields=['user', 'created_at']),
        ]

    def __str__(self):
        if self.review:
            return f"Photo for review {self.review.id} by {self.user} for {self.product.name}"
        return f"Photo by {self.user} for {self.product.name}"
