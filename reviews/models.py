from django.db import models
from django.conf import settings
from products.models import Product

class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True

class ProductReview(Review):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews')

class WebsiteReview(Review):
    pass
