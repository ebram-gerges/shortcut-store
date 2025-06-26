from django.shortcuts import render, redirect
from .models import Order, OrderItem
from cart.models import CartItem
from vouchers.models import Voucher
from django.contrib.auth.decorators import login_required
from django.db import transaction
from django.http import JsonResponse, HttpResponse
from django.core.serializers.json import DjangoJSONEncoder
from products.models import ProductColorVariant, ProductColorVariantImage, Product, ProductStock
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
import json
from django.core.mail import EmailMessage, EmailMultiAlternatives
from django.conf import settings
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from .utils import generate_order_pdf
from django.contrib.admin.views.decorators import staff_member_required
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from accounts.models import User as AccountsUser
import traceback
from email.mime.image import MIMEImage
import logging
import mimetypes

@api_view(['POST'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def place_order(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        items = data.get('items', [])
        voucher_code = data.get('voucherCode') or data.get('voucher_code') or data.get('voucher')
        shipping_info = {
            'firstName': data.get('firstName', ''),
            'lastName': data.get('lastName', ''),
            'email': data.get('email', ''),
            'address': data.get('address', ''),
            'city': data.get('city', ''),
            'governorate': data.get('governorate', ''),
            'phone': data.get('phone', ''),
        }
        
        if not items:
            return JsonResponse({'error': 'No items in order'}, status=400)

        with transaction.atomic():
            # Calculate subtotal (original prices) and validate items
            subtotal = 0
            order_items = []
            for item_data in items:
                product_id = item_data.get('id')
                quantity = item_data.get('quantity', 1)
                color = item_data.get('color', '')
                size = item_data.get('size', '')
                try:
                    product = Product.objects.get(id=product_id)
                except Product.DoesNotExist:
                    return JsonResponse({'error': f'Product with id {product_id} not found'}, status=400)
                sale_percent = getattr(product, 'sale_percent', 0) or 0
                base_price = float(product.price)
                subtotal += base_price * quantity
                # Check stock availability
                color_variant = product.color_variants.filter(color=color, is_active=True).first()
                if not color_variant:
                    return JsonResponse({'error': f'Color variant not found for {product.name}'}, status=400)
                size_variant = color_variant.size_variants.filter(size=size, is_active=True).first()
                if not size_variant:
                    return JsonResponse({'error': f'Size variant not found for {product.name} ({color}, {size})'}, status=400)
                stock_item = ProductStock.objects.filter(
                    product=product,
                    size_variant=size_variant,
                    is_active=True
                ).first()
                if not stock_item or stock_item.available_quantity < quantity:
                    return JsonResponse({
                        'error': f'Not enough stock for {product.name} ({color}, {size})'
                    }, status=400)
                order_items.append({
                    'product': product,
                    'quantity': quantity,
                    'base_price': base_price,
                    'sale_percent': sale_percent,
                    'color': color,
                    'size': size,
                    'stock_item': stock_item
                })
            # Apply voucher to subtotal (original prices)
            voucher = None
            total_after_voucher = subtotal
            if voucher_code:
                from vouchers.utils import apply_voucher as apply_voucher_util
                from decimal import Decimal
                total_after_voucher, voucher_obj = apply_voucher_util(request.user, voucher_code, Decimal(str(subtotal)))
                if voucher_obj:
                    voucher = voucher_obj
                    total_after_voucher = float(total_after_voucher)
            # Now apply sale discounts to each item, based on original price
            final_total = 0
            for item_data in order_items:
                # Proportionally distribute voucher discount to each item
                item_subtotal = item_data['base_price'] * item_data['quantity']
                if subtotal > 0:
                    item_voucher_discount = (item_subtotal / subtotal) * (subtotal - total_after_voucher)
                else:
                    item_voucher_discount = 0
                price_after_voucher = item_subtotal - item_voucher_discount
                sale_percent = item_data['sale_percent']
                price_after_sale = price_after_voucher * (1 - float(sale_percent) / 100) if sale_percent > 0 else price_after_voucher
                final_total += price_after_sale
                item_data['final_price'] = price_after_sale
                item_data['unit_final_price'] = price_after_sale / item_data['quantity'] if item_data['quantity'] else 0
            # Create order
            order = Order.objects.create(
                user=request.user,
                total_price=final_total,
                voucher=voucher,
                shipping_first_name=shipping_info['firstName'],
                shipping_last_name=shipping_info['lastName'],
                shipping_email=shipping_info['email'],
                shipping_address=shipping_info['address'],
                shipping_city=shipping_info['city'],
                shipping_governorate=shipping_info['governorate'],
                shipping_phone=shipping_info['phone'],
            )
            # Create order items and reduce stock
            for item_data in order_items:
                OrderItem.objects.create(
                    order=order,
                    product=item_data['product'],
                    quantity=item_data['quantity'],
                    price=item_data['final_price'],
                    color=item_data['color'],
                    size=item_data['size']
                )
                item_data['stock_item'].reduce_stock(item_data['quantity'])

            # --- PDF Generation ---
            pdf_data, pdf_filename = generate_order_pdf(order)

            # Prepare absolute image URLs for email
            def get_absolute_image_url(image_field):
                if not image_field:
                    return ''
                request_scheme = getattr(request, 'scheme', 'https')
                request_host = getattr(request, 'get_host', lambda: 'yourdomain.com')()
                return f"{request_scheme}://{request_host}{image_field.url}"
            for item in order.items.all():
                if hasattr(item.product, 'indoor_image') and item.product.indoor_image:
                    item.product.abs_image_url = get_absolute_image_url(item.product.indoor_image)
                elif hasattr(item.product, 'color_variants') and item.product.color_variants.first() and item.product.color_variants.first().images.first():
                    item.product.abs_image_url = get_absolute_image_url(item.product.color_variants.first().images.first().image)
                else:
                    item.product.abs_image_url = ''

            # --- Email Notification ---
            admin_email = getattr(settings, 'ADMIN_EMAIL', None) or 'admin@example.com'
            user_email = order.user.email
            subject_user = f'Order Confirmation: Serial {order.serial}'
            subject_admin = f'New Order Placed: Serial {order.serial}'
            context = {
                'order': order,
                'user': order.user,
                'site_logo_url': 'cid:site_logo',
                'product_img_cids': {},  # Will be filled below
            }

            # Attach product images and site logo for embedding
            product_img_cids = {}
            attachments = []
            items_with_cid = []
            for item in order.items.all():
                # Select the color variant that matches the ordered color
                color_variant = item.product.color_variants.filter(color=item.color, is_active=True).first()
                image_field = None
                cid = None
                if color_variant and color_variant.images.exists():
                    image_field = color_variant.images.first().image
                elif hasattr(item.product, 'indoor_image') and item.product.indoor_image:
                    image_field = item.product.indoor_image
                if image_field:
                    cid = f'product_img_{item.id}'
                    product_img_cids[item.id] = cid
                    try:
                        img_path = image_field.path
                        logging.warning(f"[ORDER EMAIL] Attaching image for item {item.id}: {img_path}")
                        mime_type, _ = mimetypes.guess_type(img_path)
                        logging.warning(f"[ORDER EMAIL] Guessed MIME type for {img_path}: {mime_type}")
                        if not mime_type or not mime_type.startswith('image/'):
                            raise ValueError(f"Could not determine image MIME type for {img_path}")
                        subtype = mime_type.split('/')[1]
                        with open(img_path, 'rb') as img_file:
                            img = MIMEImage(img_file.read(), _subtype=subtype)
                            img.add_header('Content-ID', f'<{cid}>')
                            img.add_header('Content-Disposition', 'inline', filename=f"{cid}.{subtype}")
                            attachments.append(img)
                    except Exception as e:
                        cid = None
                        logging.error(f"[ORDER EMAIL] Failed to attach image for item {item.id}: {e}")
                        traceback.print_exc()
                else:
                    logging.warning(f"[ORDER EMAIL] No image found for item {item.id}")
                items_with_cid.append({
                    'id': item.id,
                    'product': item.product,
                    'quantity': item.quantity,
                    'price': item.price,
                    'color': item.color,
                    'size': item.size,
                    'cid': cid,
                })
            context['items'] = items_with_cid
            # Attach site logo (use PNG, which exists)
            import os
            logo_path = os.path.join(os.path.dirname(__file__), '../media/site-logo-32.png')
            try:
                logging.warning(f"[ORDER EMAIL] Attaching site logo: {logo_path}")
                mime_type, _ = mimetypes.guess_type(logo_path)
                if not mime_type or not mime_type.startswith('image/'):
                    raise ValueError(f"Could not determine image MIME type for {logo_path}")
                subtype = mime_type.split('/')[1]
                with open(logo_path, 'rb') as logo_file:
                    logo_img = MIMEImage(logo_file.read(), _subtype=subtype)
                    logo_img.add_header('Content-ID', '<site_logo>')
                    logo_img.add_header('Content-Disposition', 'inline', filename=f"site-logo-32.{subtype}")
                    attachments.append(logo_img)
            except Exception as e:
                logging.error(f"[ORDER EMAIL] Failed to attach site logo: {e}")
            context['product_img_cids'] = product_img_cids

            # Log the CID for each item before rendering the email
            for item in order.items.all():
                logging.warning(f"[ORDER EMAIL] Item {item.id} - {item.product.name} - CID: {getattr(item, 'cid', None)}")

            # Render email HTML
            message_user = render_to_string('emails/order_confirmation_user.html', context)
            message_admin = render_to_string('emails/order_confirmation_admin.html', context)

            # Generate PDFs for user and admin/delivery
            user_pdf, user_pdf_filename = generate_order_pdf(order, recipient_type='user')
            admin_pdf, admin_pdf_filename = generate_order_pdf(order, recipient_type='admin')

            # Send to admin
            email_admin = EmailMultiAlternatives(subject_admin, strip_tags(message_admin), to=[admin_email])
            email_admin.attach_alternative(message_admin, "text/html")
            email_admin.attach(admin_pdf_filename, admin_pdf, 'application/pdf')
            email_admin.mixed_subtype = 'related'
            for img in attachments:
                email_admin.attach(img)
            email_admin.send(fail_silently=True)
            # Send to user
            email_user = EmailMultiAlternatives(subject_user, strip_tags(message_user), to=[user_email])
            email_user.attach_alternative(message_user, "text/html")
            email_user.attach(user_pdf_filename, user_pdf, 'application/pdf')
            email_user.mixed_subtype = 'related'
            for img in attachments:
                email_user.attach(img)
            email_user.send(fail_silently=True)
            # Send to delivery managers
            delivery_managers = AccountsUser.objects.filter(is_delivery_manager=True, is_active=True)
            for manager in delivery_managers:
                email_manager = EmailMultiAlternatives(subject_admin, strip_tags(message_admin), to=[manager.email])
                email_manager.attach_alternative(message_admin, "text/html")
                email_manager.attach(admin_pdf_filename, admin_pdf, 'application/pdf')
                email_manager.mixed_subtype = 'related'
                for img in attachments:
                    email_manager.attach(img)
                email_manager.send(fail_silently=True)

            # Increment user's orders_count
            user = request.user
            user.orders_count = getattr(user, 'orders_count', 0) + 1
            user.save(update_fields=['orders_count'])

            return JsonResponse({'success': True, 'order_id': order.id})
            
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        traceback.print_exc()  # Print the full traceback to the terminal
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def order_summary(request, order_id):
    print(f"[DEBUG] User: {request.user} (ID: {getattr(request.user, 'id', None)}), Order ID: {order_id}")
    user_orders = list(Order.objects.filter(user=request.user).values_list('id', flat=True))
    print(f"[DEBUG] All order IDs for user {request.user}: {user_orders}")
    try:
        order = Order.objects.prefetch_related('items__product').get(id=order_id, user=request.user)
        
        # Return JSON data for API calls
        data = {
            'id': order.id,
            'serial': order.serial,
            'status': order.status,
            'total_price': float(order.total_price),
            'created_at': order.created_at.isoformat(),
            'items': [
                {
                    'id': item.id,
                    'product': {
                        'id': item.product.id,
                        'name': item.product.name,
                        'image': (
                            item.product.indoor_image.url if item.product.indoor_image else (
                                item.product.color_variants.first().images.first().image.url if item.product.color_variants.exists() and item.product.color_variants.first().images.exists() else ''
                            )
                        ),
                        'sale_percent': getattr(item.product, 'sale_percent', 0) or 0,
                    },
                    'quantity': item.quantity,
                    'price': float(item.price),  # final price after sale
                    'original_price': float(item.product.price),
                    'color': item.color,
                    'size': item.size,
                }
                for item in order.items.all()
            ]
        }
        return JsonResponse({'order': data}, encoder=DjangoJSONEncoder)
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': f'Server error: {str(e)}'}, status=500)

@api_view(['GET'])
@authentication_classes([JWTAuthentication])
@permission_classes([IsAuthenticated])
def user_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at').prefetch_related('items__product')
    data = []
    for order in orders:
        data.append({
            'id': order.id,
            'serial': order.serial,
            'status': order.status,
            'total_price': float(order.total_price),
            'created_at': order.created_at,
            'items': [
                {
                    'id': item.id,
                    'product': {
                        'id': item.product.id,
                        'name': item.product.name,
                        'image': (
                            item.product.indoor_image.url if item.product.indoor_image else (
                                item.product.color_variants.first().images.first().image.url if item.product.color_variants.exists() and item.product.color_variants.first().images.exists() else ''
                            )
                        ),
                        'sale_percent': getattr(item.product, 'sale_percent', 0) or 0,
                    },
                    'quantity': item.quantity,
                    'price': float(item.price),  # final price after sale
                    'original_price': float(item.product.price),
                    'color': item.color,
                    'size': item.size,
                }
                for item in order.items.all()
            ]
        })
    return JsonResponse({'orders': data}, encoder=DjangoJSONEncoder)

@login_required
def order_by_serial(request):
    serial = request.GET.get('serial')
    if not serial:
        return JsonResponse({'error': 'Serial is required'}, status=400)
    try:
        order = Order.objects.prefetch_related('items__product').get(serial=serial)
        data = {
            'id': order.id,
            'serial': order.serial,
            'status': order.status,
            'total_price': float(order.total_price),
            'created_at': order.created_at,
            'items': [
                {
                    'id': item.id,
                    'product': {
                        'id': item.product.id,
                        'name': item.product.name,
                        'image': (item.product.image.url if item.product.image else ''),
                        'sale_percent': getattr(item.product, 'sale_percent', 0) or 0,
                    },
                    'quantity': item.quantity,
                    'price': float(item.price),  # final price after sale
                    'original_price': float(item.product.price),
                    'color': item.color,
                    'size': item.size,
                }
                for item in order.items.all()
            ]
        }
        return JsonResponse({'order': data}, encoder=DjangoJSONEncoder)
    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)

# Admin-only view to download order PDF
@staff_member_required
def download_order_pdf(request, order_id):
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return HttpResponse('Order not found', status=404)
    pdf_data, filename = generate_order_pdf(order)
    response = HttpResponse(pdf_data, content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="{filename}"'
    return response

def test_error(request):
    raise Exception("Test error: This is a debug traceback test.")
