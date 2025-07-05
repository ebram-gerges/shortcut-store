from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from .models import Order
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_order_notifications():
    """
    Send notifications for new orders
    """
    try:
        # Get orders that need notifications
        orders = Order.objects.filter(
            notification_sent=False,
            status='pending'
        ).select_related('user')
        
        for order in orders:
            # Send email notification
            send_mail(
                subject=f'Order #{order.id} Confirmation',
                message=f'Thank you for your order! Your order #{order.id} has been received and is being processed.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[order.user.email],
                fail_silently=False,
            )
            
            # Mark notification as sent
            order.notification_sent = True
            order.save(update_fields=['notification_sent'])
            
            logger.info(f'Sent notification for order #{order.id}')
            
        return f"Sent notifications for {orders.count()} orders"
        
    except Exception as e:
        logger.error(f"Error sending order notifications: {e}")
        return f"Error: {e}"

@shared_task
def update_order_status():
    """
    Update order statuses (simulate order processing)
    """
    try:
        # Simulate order status updates
        pending_orders = Order.objects.filter(status='pending')
        
        for order in pending_orders:
            # Simulate processing time
            import time
            time.sleep(0.1)  # Small delay for demo
            
            # Update status (in real app, this would be based on actual processing)
            if order.id % 3 == 0:  # Simulate some orders being processed
                order.status = 'processing'
                order.save(update_fields=['status'])
                logger.info(f'Updated order #{order.id} status to processing')
        
        return f"Updated status for {pending_orders.count()} orders"
        
    except Exception as e:
        logger.error(f"Error updating order status: {e}")
        return f"Error: {e}"

@shared_task
def process_order_payment(order_id):
    """
    Process payment for a specific order
    """
    try:
        order = Order.objects.get(id=order_id)
        
        # Simulate payment processing
        import time
        time.sleep(2)  # Simulate payment processing time
        
        # Update order status
        order.status = 'paid'
        order.save(update_fields=['status'])
        
        # Send confirmation email
        send_mail(
            subject=f'Payment Confirmed - Order #{order.id}',
            message=f'Your payment for order #{order.id} has been confirmed. Your order is now being processed.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            fail_silently=False,
        )
        
        logger.info(f'Processed payment for order #{order.id}')
        return f"Payment processed for order #{order.id}"
        
    except Order.DoesNotExist:
        logger.error(f"Order #{order_id} not found")
        return f"Order #{order_id} not found"
    except Exception as e:
        logger.error(f"Error processing payment for order #{order_id}: {e}")
        return f"Error: {e}"

@shared_task
def send_order_shipped_notification(order_id):
    """
    Send notification when order is shipped
    """
    try:
        order = Order.objects.get(id=order_id)
        
        send_mail(
            subject=f'Order #{order.id} Shipped!',
            message=f'Great news! Your order #{order.id} has been shipped and is on its way to you.',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[order.user.email],
            fail_silently=False,
        )
        
        logger.info(f'Sent shipped notification for order #{order.id}')
        return f"Shipped notification sent for order #{order.id}"
        
    except Order.DoesNotExist:
        logger.error(f"Order #{order_id} not found")
        return f"Order #{order_id} not found"
    except Exception as e:
        logger.error(f"Error sending shipped notification for order #{order_id}: {e}")
        return f"Error: {e}" 