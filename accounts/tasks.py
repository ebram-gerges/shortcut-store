from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

@shared_task
def cleanup_expired_sessions():
    """
    Clean up expired user sessions
    """
    try:
        from django.contrib.sessions.models import Session
        
        # Delete expired sessions
        expired_sessions = Session.objects.filter(expire_date__lt=timezone.now())
        count = expired_sessions.count()
        expired_sessions.delete()
        
        logger.info(f'Cleaned up {count} expired sessions')
        return f"Cleaned up {count} expired sessions"
        
    except Exception as e:
        logger.error(f"Error cleaning up expired sessions: {e}")
        return f"Error: {e}"

@shared_task
def send_welcome_email(user_id):
    """
    Send welcome email to new users
    """
    try:
        user = User.objects.get(id=user_id)
        
        send_mail(
            subject='Welcome to Shortcut Store!',
            message=f'''
            Hi {user.first_name or user.email},
            
            Welcome to Shortcut Store! We're excited to have you as a customer.
            
            Here are some things you can do:
            - Browse our product catalog
            - Add items to your wishlist
            - Complete your first purchase
            
            If you have any questions, feel free to contact our support team.
            
            Best regards,
            The Shortcut Store Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f'Sent welcome email to user {user.email}')
        return f"Welcome email sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return f"User {user_id} not found"
    except Exception as e:
        logger.error(f"Error sending welcome email to user {user_id}: {e}")
        return f"Error: {e}"

@shared_task
def send_password_reset_email(user_id):
    """
    Send password reset email
    """
    try:
        user = User.objects.get(id=user_id)
        
        # Generate reset token (simplified for demo)
        reset_token = f"reset_{user.id}_{timezone.now().timestamp()}"
        
        send_mail(
            subject='Password Reset Request',
            message=f'''
            Hi {user.first_name or user.email},
            
            You requested a password reset for your Shortcut Store account.
            
            Click the following link to reset your password:
            http://localhost:5173/reset-password?token={reset_token}
            
            If you didn't request this, please ignore this email.
            
            Best regards,
            The Shortcut Store Team
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        
        logger.info(f'Sent password reset email to user {user.email}')
        return f"Password reset email sent to {user.email}"
        
    except User.DoesNotExist:
        logger.error(f"User {user_id} not found")
        return f"User {user_id} not found"
    except Exception as e:
        logger.error(f"Error sending password reset email to user {user_id}: {e}")
        return f"Error: {e}"

@shared_task
def send_inactive_user_reminder():
    """
    Send reminder emails to inactive users
    """
    try:
        # Find users who haven't logged in for 30 days
        thirty_days_ago = timezone.now() - timedelta(days=30)
        inactive_users = User.objects.filter(
            last_login__lt=thirty_days_ago,
            is_active=True
        )
        
        for user in inactive_users:
            send_mail(
                subject='We Miss You at Shortcut Store!',
                message=f'''
                Hi {user.first_name or user.email},
                
                We noticed you haven't visited Shortcut Store in a while.
                We have some great new products that might interest you!
                
                Come back and check out our latest collection:
                http://localhost:5173/products
                
                Best regards,
                The Shortcut Store Team
                ''',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )
            
            logger.info(f'Sent inactive reminder to user {user.email}')
        
        return f"Sent inactive reminders to {inactive_users.count()} users"
        
    except Exception as e:
        logger.error(f"Error sending inactive user reminders: {e}")
        return f"Error: {e}"

@shared_task
def update_user_statistics():
    """
    Update user statistics (orders count, etc.)
    """
    try:
        from orders.models import Order
        
        users = User.objects.all()
        updated_count = 0
        
        for user in users:
            # Count user's orders
            orders_count = Order.objects.filter(user=user).count()
            
            # Update user's orders count if it has changed
            if user.orders_count != orders_count:
                user.orders_count = orders_count
                user.save(update_fields=['orders_count'])
                updated_count += 1
                logger.info(f'Updated orders count for user {user.email}: {orders_count}')
        
        return f"Updated statistics for {updated_count} users"
        
    except Exception as e:
        logger.error(f"Error updating user statistics: {e}")
        return f"Error: {e}" 