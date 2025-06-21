from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import CartItem
from .serializers import (
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
    CartSummarySerializer
)
from products.models import Product, ProductColorVariant


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_cart_view(request):
    """Get user's cart items"""
    cart_items = CartItem.objects.filter(user=request.user).select_related(
        'product', 'color_variant'
    ).prefetch_related('color_variant__images')
    
    serializer = CartSummarySerializer(cart_items)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart_view(request):
    """Add item to cart"""
    serializer = AddToCartSerializer(data=request.data)
    if serializer.is_valid():
        product = serializer.validated_data['product']
        color_variant = serializer.validated_data.get('color_variant')
        size = serializer.validated_data.get('size')
        quantity = serializer.validated_data['quantity']
        
        # Check if item already exists in cart
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            color_variant=color_variant,
            size=size,
            defaults={'quantity': quantity}
        )
        
        if not created:
            # Update existing cart item
            cart_item.quantity += quantity
            cart_item.save()
        
        # Return updated cart
        cart_items = CartItem.objects.filter(user=request.user)
        cart_serializer = CartSummarySerializer(cart_items)
        
        return Response({
            'message': f'Added {product.name} to cart',
            'cart': cart_serializer.data
        }, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_item_view(request, item_id):
    """Update cart item quantity"""
    cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
    
    serializer = UpdateCartItemSerializer(cart_item, data=request.data)
    if serializer.is_valid():
        cart_item.quantity = serializer.validated_data['quantity']
        cart_item.save()
        
        # Return updated cart
        cart_items = CartItem.objects.filter(user=request.user)
        cart_serializer = CartSummarySerializer(cart_items)
        
        return Response({
            'message': 'Cart item updated successfully',
            'cart': cart_serializer.data
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart_view(request, item_id):
    """Remove item from cart"""
    cart_item = get_object_or_404(CartItem, id=item_id, user=request.user)
    product_name = cart_item.product.name
    cart_item.delete()
    
    # Return updated cart
    cart_items = CartItem.objects.filter(user=request.user)
    cart_serializer = CartSummarySerializer(cart_items)
    
    return Response({
        'message': f'Removed {product_name} from cart',
        'cart': cart_serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_cart_view(request):
    """Clear all items from cart"""
    CartItem.objects.filter(user=request.user).delete()
    
    return Response({
        'message': 'Cart cleared successfully',
        'cart': {
            'items': [],
            'total_items': 0,
            'total_price': 0
        }
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def cart_count_view(request):
    """Get cart item count"""
    count = CartItem.objects.filter(user=request.user).count()
    return Response({'count': count})
