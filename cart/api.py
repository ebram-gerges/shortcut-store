from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CartItem
from .serializers import CartItemSerializer
from products.models import Product, ProductColorVariant

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CartItem.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def add(self, request):
        product_id = request.data.get('product_id')
        color_variant_id = request.data.get('color_variant_id')
        size = request.data.get('size')
        quantity = int(request.data.get('quantity', 1))
        if not product_id or not color_variant_id or not size:
            return Response({'error': 'Missing required fields.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(id=product_id)
            color_variant = ProductColorVariant.objects.get(id=color_variant_id)
        except (Product.DoesNotExist, ProductColorVariant.DoesNotExist):
            return Response({'error': 'Product or color variant not found.'}, status=status.HTTP_404_NOT_FOUND)
        cart_item, created = CartItem.objects.get_or_create(
            user=request.user,
            product=product,
            color_variant=color_variant,
            size=size,
            defaults={'quantity': quantity}
        )
        if not created:
            cart_item.quantity += quantity
            cart_item.save()
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def remove(self, request):
        cart_item_id = request.data.get('cart_item_id')
        try:
            cart_item = CartItem.objects.get(id=cart_item_id, user=request.user)
            cart_item.delete()
            return Response({'detail': 'Item removed from cart.'}, status=status.HTTP_204_NO_CONTENT)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['post'])
    def update_quantity(self, request):
        cart_item_id = request.data.get('cart_item_id')
        quantity = int(request.data.get('quantity', 1))
        try:
            cart_item = CartItem.objects.get(id=cart_item_id, user=request.user)
            cart_item.quantity = quantity
            cart_item.save()
            serializer = self.get_serializer(cart_item)
            return Response(serializer.data)
        except CartItem.DoesNotExist:
            return Response({'error': 'Cart item not found.'}, status=status.HTTP_404_NOT_FOUND) 