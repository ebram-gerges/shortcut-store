from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token
from django.db.models import Sum
import json
from .models import Product, ProductColorVariant, ProductStock
from cart.models import CartItem
from wishlist.models import WishlistItem

def product_list(request):
    # Filtering logic
    products = Product.objects.all().prefetch_related('color_variants')
    filters = {
        'category': request.GET.get('category'),
    }
    min_price = request.GET.get('min_price')
    max_price = request.GET.get('max_price')
    sale_percent = request.GET.get('sale')

    for field, value in filters.items():
        if value:
            products = products.filter(**{field: value})
    if min_price:
        products = products.filter(price__gte=min_price)
    if max_price:
        products = products.filter(price__lte=max_price)
    if sale_percent:
        # Filter products with the exact sale percentage
        products = products.filter(sale_percent=sale_percent)

    return render(request, 'products/product_list.html', {'products': products})

def product_detail(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    color_variants = product.color_variants.filter(is_active=True).prefetch_related('images')
    size_variants = product.variants.filter(is_active=True)

    # Get the selected color variant (default to first available)
    selected_color = request.GET.get('color')
    if selected_color:
        current_color_variant = color_variants.filter(color=selected_color).first()
        # If the requested color doesn't exist, fall back to first available
        if not current_color_variant:
            current_color_variant = color_variants.first()
            selected_color = current_color_variant.color if current_color_variant else None
    else:
        current_color_variant = color_variants.first()
        selected_color = current_color_variant.color if current_color_variant else None

    context = {
        'product': product,
        'color_variants': color_variants,
        'size_variants': size_variants,
        'current_color_variant': current_color_variant,
        'selected_color': selected_color,
    }

    return render(request, 'products/product_detail.html', context)

def get_color_variant_images(request, product_id, color):
    """AJAX endpoint to get images for a specific color variant"""
    try:
        product = get_object_or_404(Product, id=product_id)
        color_variant = product.color_variants.filter(color=color, is_active=True).first()

        if not color_variant:
            return JsonResponse({'error': 'Color variant not found'}, status=404)

        images = []
        for img in color_variant.images.all():
            images.append({
                'url': img.image.url,
                'alt_text': img.alt_text or f"{product.name} - {color}",
                'is_primary': img.is_primary,
                'order': img.order
            })

        return JsonResponse({
            'color': color,
            'images': images,
            'stock': color_variant.stock
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_stock_status(request, product_id, color, size):
    """AJAX endpoint to get stock status for a specific color-size combination"""
    try:
        product = get_object_or_404(Product, id=product_id)
        color_variant = product.color_variants.filter(color=color, is_active=True).first()

        if not color_variant:
            return JsonResponse({'error': 'Color variant not found'}, status=404)

        stock_item = ProductStock.objects.filter(
            product=product,
            color_variant=color_variant,
            size=size,
            is_active=True
        ).first()

        if not stock_item:
            return JsonResponse({
                'available_quantity': 0,
                'stock_status': 'out_of_stock',
                'stock_display': 'Out of Stock',
                'can_add_to_cart': False
            })

        return JsonResponse({
            'available_quantity': stock_item.available_quantity,
            'stock_status': stock_item.stock_status,
            'stock_display': stock_item.stock_display,
            'can_add_to_cart': stock_item.available_quantity > 0,
            'max_quantity': min(10, stock_item.available_quantity)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def add_to_cart(request):
    """AJAX endpoint to add items to cart"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Restrict to authenticated users only
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to add items to your cart.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        color = data.get('color')
        size = data.get('size')
        quantity = int(data.get('quantity', 1))

        # Validate inputs
        if not all([product_id, color, size]):
            return JsonResponse({'error': 'Missing required fields'}, status=400)

        if quantity <= 0 or quantity > 10:
            return JsonResponse({'error': 'Invalid quantity'}, status=400)

        # Get product and variants
        product = get_object_or_404(Product, id=product_id)
        color_variant = product.color_variants.filter(color=color, is_active=True).first()

        if not color_variant:
            return JsonResponse({'error': 'Color variant not found'}, status=404)

        # Check stock
        stock_item = ProductStock.objects.filter(
            product=product,
            color_variant=color_variant,
            size=size,
            is_active=True
        ).first()

        if not stock_item or not stock_item.can_reserve(quantity):
            return JsonResponse({
                'error': 'Insufficient stock',
                'available_quantity': stock_item.available_quantity if stock_item else 0
            }, status=400)

        # Get or create session if it doesn't exist
        if not request.session.session_key:
            request.session.create()

        # Get user or session identifier
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key if not user else None

        # Check if item already in cart
        existing_cart_item = CartItem.objects.filter(
            user=user,
            session_key=session_key,
            product=product,
            color_variant=color_variant,
            size=size
        ).first()

        current_cart_quantity = existing_cart_item.quantity if existing_cart_item else 0
        total_requested = current_cart_quantity + quantity

        if not stock_item.can_reserve(total_requested):
            return JsonResponse({
                'error': f'Cannot add {quantity} items. Only {stock_item.available_quantity - current_cart_quantity} available.',
                'available_quantity': stock_item.available_quantity - current_cart_quantity
            }, status=400)

        # Get or create cart item
        cart_item, created = CartItem.objects.get_or_create(
            user=user,
            session_key=session_key,
            product=product,
            color_variant=color_variant,
            size=size,
            defaults={'quantity': quantity}
        )

        if not created:
            # Update existing cart item
            cart_item.quantity += quantity
            cart_item.save()

        # Calculate cart totals
        cart_filter = {'user': user} if user else {'session_key': session_key}
        cart_total = CartItem.objects.filter(**cart_filter).aggregate(
            total=Sum('quantity')
        )['total'] or 0

        return JsonResponse({
            'success': True,
            'message': f'Added {quantity} item(s) to cart',
            'cart_count': cart_total,
            'item_total': total_requested
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def add_to_wishlist(request):
    """AJAX endpoint to add/remove items from wishlist"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Restrict to authenticated users only
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to add items to your wishlist.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        action = data.get('action', 'toggle')  # 'add', 'remove', or 'toggle'

        if not product_id:
            return JsonResponse({'error': 'Product ID required'}, status=400)

        # Get product
        product = get_object_or_404(Product, id=product_id)

        # Get or create session if it doesn't exist
        if not request.session.session_key:
            request.session.create()

        # Get user or session identifier
        user = request.user if request.user.is_authenticated else None
        session_key = request.session.session_key if not user else None

        # Check if item is in wishlist
        wishlist_item = WishlistItem.objects.filter(
            user=user,
            session_key=session_key,
            product=product
        ).first()

        is_in_wishlist = wishlist_item is not None

        if action == 'toggle':
            if is_in_wishlist:
                wishlist_item.delete()
                message = 'Removed from wishlist'
                in_wishlist = False
            else:
                WishlistItem.objects.create(
                    user=user,
                    session_key=session_key,
                    product=product
                )
                message = 'Added to wishlist'
                in_wishlist = True
        elif action == 'add' and not is_in_wishlist:
            WishlistItem.objects.create(
                user=user,
                session_key=session_key,
                product=product
            )
            message = 'Added to wishlist'
            in_wishlist = True
        elif action == 'remove' and is_in_wishlist:
            wishlist_item.delete()
            message = 'Removed from wishlist'
            in_wishlist = False
        else:
            message = 'No change'
            in_wishlist = is_in_wishlist

        # Calculate wishlist count
        wishlist_filter = {'user': user} if user else {'session_key': session_key}
        wishlist_count = WishlistItem.objects.filter(**wishlist_filter).count()

        return JsonResponse({
            'success': True,
            'message': message,
            'in_wishlist': in_wishlist,
            'wishlist_count': wishlist_count
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_cart(request):
    """AJAX endpoint to get cart data"""
    # Restrict to authenticated users only
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': True,
            'cart_items': [],
            'cart_count': 0,
            'cart_total': 0,
            'message': 'Please log in to view your cart.'
        })

    # Get or create session if it doesn't exist
    if not request.session.session_key:
        request.session.create()

    # Get user or session identifier
    user = request.user if request.user.is_authenticated else None
    session_key = request.session.session_key if not user else None

    # Get cart items
    cart_filter = {'user': user} if user else {'session_key': session_key}
    cart_items = CartItem.objects.filter(**cart_filter).select_related(
        'product', 'color_variant'
    ).prefetch_related('color_variant__images')

    # Build cart data
    cart_data = []
    total_quantity = 0
    total_price = 0

    for item in cart_items:
        # Get primary image for color variant
        primary_image = item.color_variant.images.filter(is_primary=True).first()
        image_url = ''
        if primary_image:
            image_url = primary_image.image.url
        elif item.product.image:
            image_url = item.product.image.url

        item_data = {
            'id': item.id,
            'product_id': item.product.id,
            'product_name': item.product.name,
            'color': item.color_variant.color if item.color_variant else '',
            'size': item.size or '',
            'quantity': item.quantity,
            'price': float(item.product.discounted_price),
            'original_price': float(item.product.price),
            'total_price': float(item.total_price),
            'image_url': image_url,
            'sale_percent': item.product.sale_percent,
        }
        cart_data.append(item_data)
        total_quantity += item.quantity
        total_price += item.total_price

    return JsonResponse({
        'success': True,
        'cart_items': cart_data,
        'cart_count': total_quantity,
        'cart_total': float(total_price)
    })


@csrf_exempt
def remove_from_cart(request):
    """AJAX endpoint to remove items from cart"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Restrict to authenticated users only
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to modify your cart.'
        }, status=401)

    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        color = data.get('color', '')
        size = data.get('size', '')

        if not product_id:
            return JsonResponse({'error': 'Product ID is required'}, status=400)

        # Get the product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)

        # Get color variant if specified
        color_variant = None
        if color:
            try:
                color_variant = ProductColorVariant.objects.get(product=product, color=color)
            except ProductColorVariant.DoesNotExist:
                pass

        # Find and remove cart item
        cart_item = CartItem.objects.filter(
            user=request.user,
            product=product,
            color_variant=color_variant,
            size=size or None
        ).first()

        if cart_item:
            cart_item.delete()
            message = 'Item removed from cart'
        else:
            message = 'Item not found in cart'

        # Calculate new cart totals
        cart_total = CartItem.objects.filter(user=request.user).aggregate(
            total=Sum('quantity')
        )['total'] or 0

        return JsonResponse({
            'success': True,
            'message': message,
            'cart_count': cart_total
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def update_cart_quantity(request):
    """AJAX endpoint to update cart item quantity"""
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    # Restrict to authenticated users only
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to modify your cart.'
        }, status=401)

    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        color = data.get('color', '')
        size = data.get('size', '')
        quantity = int(data.get('quantity', 1))

        if not product_id:
            return JsonResponse({'error': 'Product ID is required'}, status=400)

        if quantity < 1:
            return JsonResponse({'error': 'Quantity must be at least 1'}, status=400)

        # Get the product
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)

        # Get color variant if specified
        color_variant = None
        if color:
            try:
                color_variant = ProductColorVariant.objects.get(product=product, color=color)
            except ProductColorVariant.DoesNotExist:
                pass

        # Find cart item
        cart_item = CartItem.objects.filter(
            user=request.user,
            product=product,
            color_variant=color_variant,
            size=size or None
        ).first()

        if cart_item:
            cart_item.quantity = quantity
            cart_item.save()
            message = 'Cart updated'
        else:
            return JsonResponse({'error': 'Item not found in cart'}, status=404)

        # Calculate new cart totals
        cart_total = CartItem.objects.filter(user=request.user).aggregate(
            total=Sum('quantity')
        )['total'] or 0

        return JsonResponse({
            'success': True,
            'message': message,
            'cart_count': cart_total,
            'item_quantity': quantity
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except ValueError:
        return JsonResponse({'error': 'Invalid quantity value'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def quick_view(request, product_id):
    """AJAX endpoint for quick view modal data"""
    try:
        product = get_object_or_404(Product, id=product_id)

        # Get product images from color variants
        product_images = []
        first_variant = product.color_variants.filter(is_active=True).first()
        if first_variant:
            for image in first_variant.images.all():
                product_images.append({
                    'url': image.image.url,
                    'alt': image.alt_text or product.name
                })
        elif product.image:
            # Fallback to main product image
            product_images.append({
                'url': product.image.url,
                'alt': product.name
            })

        # Get color variants
        color_variants = []
        for variant in product.color_variants.filter(is_active=True):
            color_variants.append({
                'id': variant.id,
                'color': variant.color,
                'color_code': variant.color_hex if hasattr(variant, 'color_hex') else variant.color,
                'images': [{'url': img.image.url, 'alt': img.alt_text or product.name}
                          for img in variant.images.all()]
            })

        # Get available sizes
        available_sizes = []
        if product.stock_items.exists():
            sizes = product.stock_items.values_list('size', flat=True).distinct()
            available_sizes = [size for size in sizes if size]

        # Calculate stock status
        total_stock = sum(item.available_quantity for item in product.stock_items.all())

        response_data = {
            'success': True,
            'product': {
                'id': product.id,
                'name': product.name,
                'description': product.description,
                'price': float(product.price),
                'discounted_price': float(product.discounted_price),
                'is_on_sale': product.is_on_sale,
                'discount_percentage': product.discount_percentage,
                'images': product_images,
                'color_variants': color_variants,
                'available_sizes': available_sizes,
                'total_stock': total_stock,
                'in_stock': total_stock > 0,
                'product_url': f'/products/{product.id}/'
            }
        }

        return JsonResponse(response_data)

    except Product.DoesNotExist:
        return JsonResponse({
            'success': False,
            'error': 'Product not found'
        }, status=404)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': f'Error loading product: {str(e)}'
        }, status=500)