from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
import json
from .models import CartItem
from products.models import Product, ProductStock, ProductColorVariant
from vouchers.utils import apply_voucher

@login_required
def view_cart(request):
    """Cart page view - restricted to authenticated users"""
    cart_items = CartItem.objects.filter(user=request.user).select_related('product', 'color_variant')

    # Calculate totals
    subtotal = sum(item.sale_total_price() for item in cart_items)
    original_total = sum(item.original_total_price() for item in cart_items)
    total_savings = original_total - subtotal

    # Apply voucher if provided
    voucher_code = request.GET.get('voucher')
    if voucher_code:
        discounted_total, discount = apply_voucher(voucher_code, subtotal)
    else:
        discounted_total, discount = subtotal, 0

    # Calculate shipping
    free_shipping_threshold = 1000
    shipping_cost = 0 if discounted_total >= free_shipping_threshold else 50
    final_total = discounted_total + shipping_cost

    context = {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'original_total': original_total,
        'total_savings': total_savings,
        'discounted_total': discounted_total,
        'discount': discount,
        'shipping_cost': shipping_cost,
        'final_total': final_total,
        'free_shipping_threshold': free_shipping_threshold,
        'voucher_code': voucher_code,
        'cart_count': cart_items.count(),
    }

    return render(request, 'cart/cart.html', context)

@csrf_exempt
@require_http_methods(["POST"])
def remove_from_cart(request):
    """AJAX endpoint to remove items from cart"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to manage your cart.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        data = json.loads(request.body)
        item_id = data.get('item_id')

        if not item_id:
            return JsonResponse({'error': 'Item ID is required'}, status=400)

        # Get and delete the cart item
        cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
        cart_item.delete()

        # Calculate new cart totals
        remaining_items = CartItem.objects.filter(user=request.user)
        cart_total = remaining_items.aggregate(total=Sum('quantity'))['total'] or 0

        return JsonResponse({
            'success': True,
            'message': 'Item removed from cart',
            'cart_count': cart_total
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def update_cart_quantity(request):
    """AJAX endpoint to update cart item quantity"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to manage your cart.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        data = json.loads(request.body)
        item_id = data.get('item_id')
        quantity = data.get('quantity')

        if not item_id or not quantity:
            return JsonResponse({'error': 'Item ID and quantity are required'}, status=400)

        quantity = int(quantity)
        if quantity < 1:
            return JsonResponse({'error': 'Quantity must be at least 1'}, status=400)

        # Get the cart item
        cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)

        # Check stock availability
        if cart_item.color_variant and cart_item.size:
            try:
                stock_item = ProductStock.objects.get(
                    product=cart_item.product,
                    color_variant=cart_item.color_variant,
                    size=cart_item.size
                )
                if quantity > stock_item.available_quantity:
                    return JsonResponse({
                        'error': f'Only {stock_item.available_quantity} items available in stock',
                        'max_quantity': stock_item.available_quantity
                    }, status=400)
            except ProductStock.DoesNotExist:
                return JsonResponse({'error': 'Product variant not available'}, status=400)

        # Update quantity
        cart_item.quantity = quantity
        cart_item.save()

        # Calculate new totals
        cart_items = CartItem.objects.filter(user=request.user)
        cart_total = cart_items.aggregate(total=Sum('quantity'))['total'] or 0
        item_total = cart_item.sale_total_price()

        return JsonResponse({
            'success': True,
            'message': 'Cart updated successfully',
            'cart_count': cart_total,
            'item_total': item_total,
            'item_quantity': cart_item.quantity
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except ValueError:
        return JsonResponse({'error': 'Invalid quantity value'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def add_to_cart(request):
    """AJAX endpoint to add items to cart"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to manage your cart.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        color = data.get('color')
        size = data.get('size', 'M')
        quantity = int(data.get('quantity', 1))

        if not product_id:
            return JsonResponse({'error': 'Product ID is required'}, status=400)

        # Get the product
        product = get_object_or_404(Product, id=product_id)

        # Get color variant if color is provided
        color_variant = None
        if color:
            try:
                # Case-insensitive color lookup
                color_variant = product.color_variants.filter(
                    color__iexact=color,
                    is_active=True
                ).first()
                if not color_variant:
                    return JsonResponse({
                        'error': f'Color variant "{color}" not found. Available colors: {", ".join(cv.color for cv in product.color_variants.filter(is_active=True))}'
                    }, status=400)
            except Exception as e:
                return JsonResponse({'error': f'Error finding color variant: {str(e)}'}, status=400)

        # Check stock availability if color and size are provided
        if color_variant and size:
            try:
                stock_item = ProductStock.objects.get(
                    product=product,
                    color_variant=color_variant,
                    size=size
                )
                if quantity > stock_item.available_quantity:
                    return JsonResponse({
                        'error': f'Only {stock_item.available_quantity} items available in stock',
                        'max_quantity': stock_item.available_quantity
                    }, status=400)
            except ProductStock.DoesNotExist:
                return JsonResponse({'error': 'Product variant not available'}, status=400)

        # Get or create cart item
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            color_variant=color_variant,
            size=size if size else None,
            defaults={'quantity': quantity}
        )

        if not created:
            cart_item.quantity += quantity
            cart_item.save()

        # Calculate new cart totals
        cart_items = CartItem.objects.filter(user=request.user)
        cart_total = cart_items.aggregate(total=Sum('quantity'))['total'] or 0

        return JsonResponse({
            'success': True,
            'message': 'Item added to cart successfully',
            'cart_count': cart_total,
            'item': {
                'id': cart_item.id,
                'product_name': product.name,
                'product_image': product.get_first_image.image.url if product.get_first_image else None,
                'price': float(cart_item.sale_total_price()),
                'quantity': cart_item.quantity,
                'color': color_variant.color if color_variant else None,
                'size': size
            }
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except ValueError:
        return JsonResponse({'error': 'Invalid quantity value'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["GET"])
def get_cart(request):
    """AJAX endpoint to get cart data"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to view your cart.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        cart_items = CartItem.objects.filter(user=request.user).select_related('product', 'color_variant')
        
        cart_data = [{
            'id': item.id,
            'product_id': item.product.id,
            'product_name': item.product.name,
            'product_image': item.product.image.url if item.product.image else None,
            'price': float(item.sale_total_price()),
            'quantity': item.quantity,
            'color': item.color_variant.color if item.color_variant else None,
            'size': item.size
        } for item in cart_items]

        return JsonResponse({
            'success': True,
            'cart_items': cart_data,
            'cart_count': sum(item['quantity'] for item in cart_data)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)