from celery import shared_task
from django.core.mail import send_mail
from django.core.cache import cache
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_welcome_email(self, user_email, user_name=None):
    """Send welcome email to new users with retry logic"""
    try:
        subject = 'Welcome to Shortcut Store!'
        message = f"""
        Hello {user_name or 'there'}!
        
        Thank you for registering with Shortcut Store. We're excited to have you on board!
        
        Best regards,
        The Shortcut Store Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user_email],
            fail_silently=False,
        )
        logger.info(f"Welcome email sent successfully to {user_email}")
        return True
        
    except Exception as exc:
        logger.error(f"Failed to send welcome email to {user_email}: {exc}")
        raise self.retry(exc=exc)

@shared_task
def clear_expired_cache():
    """Clear expired cache entries"""
    try:
        # This will clear expired keys from Redis
        cache.clear()
        logger.info("Cache cleared successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        return False

@shared_task
def update_product_stock_cache():
    """Update product stock cache for frequently accessed data"""
    try:
        from products.models import Product
        
        # Cache featured products
        featured_products = Product.objects.filter(
            sale_percent__gt=0
        ).select_related('category').prefetch_related(
            'color_variants__images'
        ).only('id', 'name', 'price', 'sale_percent', 'category')[:8]
        
        cache.set('featured_products', list(featured_products), 600)  # 10 minutes
        logger.info("Product stock cache updated successfully")
        return True
        
    except Exception as e:
        logger.error(f"Failed to update product stock cache: {e}")
        return False

@shared_task(bind=True, max_retries=3, default_retry_delay=300)
def process_order_notification(self, order_id):
    """Process order notifications with retry logic"""
    try:
        from orders.models import Order
        
        order = Order.objects.select_related('user').get(id=order_id)
        
        # Send order confirmation email
        subject = f'Order Confirmation - #{order.serial}'
        message = f"""
        Hello {order.user.first_name or order.user.username},
        
        Your order #{order.serial} has been confirmed and is being processed.
        Total: ${order.total_price}
        
        Thank you for your purchase!
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [order.user.email],
            fail_silently=False,
        )
        
        logger.info(f"Order notification sent for order {order.serial}")
        return True
        
    except Order.DoesNotExist:
        logger.error(f"Order {order_id} not found")
        return False
    except Exception as exc:
        logger.error(f"Failed to process order notification for {order_id}: {exc}")
        raise self.retry(exc=exc) 