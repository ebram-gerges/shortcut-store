from django.shortcuts import render, redirect, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.db.models import Count
import json
from .models import WishlistItem
from products.models import Product

@login_required
def view_wishlist(request):
    """Wishlist page view - restricted to authenticated users"""
    wishlist_items = WishlistItem.objects.filter(user=request.user).select_related('product')

    context = {
        'wishlist_items': wishlist_items,
        'wishlist_count': wishlist_items.count(),
    }

    return render(request, 'wishlist/wishlist.html', context)

@csrf_exempt
@require_http_methods(["POST"])
def add_to_wishlist(request):
    """AJAX endpoint to add/remove items from wishlist"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to manage your wishlist.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        data = json.loads(request.body)
        product_id = data.get('product_id')
        action = data.get('action', 'toggle')  # 'add', 'remove', or 'toggle'

        if not product_id:
            return JsonResponse({'error': 'Product ID is required'}, status=400)

        product = get_object_or_404(Product, id=product_id)

        # Check if item exists in wishlist
        wishlist_item = WishlistItem.objects.filter(user=request.user, product=product).first()

        if action == 'toggle':
            if wishlist_item:
                # Remove from wishlist
                wishlist_item.delete()
                message = f'{product.name} removed from wishlist'
                in_wishlist = False
            else:
                # Add to wishlist
                WishlistItem.objects.create(user=request.user, product=product)
                message = f'{product.name} added to wishlist'
                in_wishlist = True
        elif action == 'add':
            if not wishlist_item:
                WishlistItem.objects.create(user=request.user, product=product)
                message = f'{product.name} added to wishlist'
                in_wishlist = True
            else:
                message = f'{product.name} is already in your wishlist'
                in_wishlist = True
        elif action == 'remove':
            if wishlist_item:
                wishlist_item.delete()
                message = f'{product.name} removed from wishlist'
                in_wishlist = False
            else:
                message = f'{product.name} is not in your wishlist'
                in_wishlist = False
        else:
            return JsonResponse({'error': 'Invalid action'}, status=400)

        # Get updated wishlist count
        wishlist_count = WishlistItem.objects.filter(user=request.user).count()

        return JsonResponse({
            'success': True,
            'message': message,
            'in_wishlist': in_wishlist,
            'wishlist_count': wishlist_count
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def remove_from_wishlist(request):
    """AJAX endpoint to remove items from wishlist"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'error': 'Authentication required',
            'message': 'Please log in to manage your wishlist.',
            'redirect_url': '/accounts/login/'
        }, status=401)

    try:
        data = json.loads(request.body)
        item_id = data.get('item_id')

        if not item_id:
            return JsonResponse({'error': 'Item ID is required'}, status=400)

        # Get and delete the wishlist item
        wishlist_item = get_object_or_404(WishlistItem, id=item_id, user=request.user)
        product_name = wishlist_item.product.name
        wishlist_item.delete()

        # Get updated wishlist count
        wishlist_count = WishlistItem.objects.filter(user=request.user).count()

        return JsonResponse({
            'success': True,
            'message': f'{product_name} removed from wishlist',
            'wishlist_count': wishlist_count
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_wishlist(request):
    """AJAX endpoint to get wishlist data"""
    if not request.user.is_authenticated:
        return JsonResponse({
            'success': True,
            'wishlist_items': [],
            'wishlist_count': 0,
            'message': 'Please log in to view your wishlist.'
        })

    try:
        wishlist_items = WishlistItem.objects.filter(user=request.user).select_related('product')
        wishlist_data = []

        for item in wishlist_items:
            wishlist_data.append({
                'id': item.id,
                'product_id': item.product.id,
                'product_name': item.product.name,
                'product_price': float(item.product.price),
                'product_image': item.product.get_first_image.image.url if item.product.get_first_image else '',
                'added_at': item.added_at.isoformat()
            })

        return JsonResponse({
            'success': True,
            'wishlist_items': wishlist_data,
            'wishlist_count': len(wishlist_data)
        })

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
