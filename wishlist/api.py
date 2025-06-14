from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import WishlistItem
from .serializers import WishlistItemSerializer
from products.models import Product

class WishlistViewSet(viewsets.ModelViewSet):
    serializer_class = WishlistItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return WishlistItem.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def add(self, request):
        product_id = request.data.get('product_id')
        if not product_id:
            print('Wishlist add error: Missing product_id')
            return Response({'error': 'Missing product_id.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            print(f'Wishlist add error: Product {product_id} not found')
            return Response({'error': 'Product not found.'}, status=status.HTTP_404_NOT_FOUND)
        wishlist_item, created = WishlistItem.objects.get_or_create(
            user=request.user,
            product=product
        )
        serializer = self.get_serializer(wishlist_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def remove(self, request):
        wishlist_item_id = request.data.get('wishlist_item_id')
        try:
            wishlist_item = WishlistItem.objects.get(id=wishlist_item_id, user=request.user)
            wishlist_item.delete()
            return Response({'detail': 'Item removed from wishlist.'}, status=status.HTTP_204_NO_CONTENT)
        except WishlistItem.DoesNotExist:
            print(f'Wishlist remove error: Wishlist item {wishlist_item_id} not found')
            return Response({'error': 'Wishlist item not found.'}, status=status.HTTP_404_NOT_FOUND) 