from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import ProductSizeVariant, ProductStock

@receiver(post_save, sender=ProductSizeVariant)
def sync_product_stock(sender, instance, **kwargs):
    # Always create or update ProductStock for this size variant
    ProductStock.objects.update_or_create(
        product=instance.color_variant.product,
        size_variant=instance,
        defaults={
            'quantity': instance.stock,
            'is_active': instance.is_active,
        }
    )

@receiver(post_delete, sender=ProductSizeVariant)
def delete_product_stock(sender, instance, **kwargs):
    ProductStock.objects.filter(size_variant=instance).delete() 