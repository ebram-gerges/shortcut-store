from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Order, OrderItem
from .serializers import OrderSerializer
from cart.models import CartItem
from products.models import ProductColorVariant
from django.db import transaction

class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)

    @action(detail=False, methods=['post'])
    def checkout(self, request):
        # For now, just return cart items and user info
        cart_items = CartItem.objects.filter(user=request.user)
        cart_data = [
            {
                'product': str(item.product),
                'color': item.color_variant.color if item.color_variant else None,
                'size': item.size,
                'quantity': item.quantity,
                'price': float(item.product.price),
            }
            for item in cart_items
        ]
        return Response({
            'user': request.user.username,
            'cart': cart_data
        })

    @action(detail=False, methods=['post'])
    def place(self, request):
        try:
            with transaction.atomic():
                data = request.data
                shipping = data.get('shipping', {})
                payment_method = data.get('payment_method', 'cod')
                cart_items = CartItem.objects.filter(user=request.user)
                if not cart_items.exists():
                    print('Order place error: Cart is empty')
                    return Response({'error': 'Cart is empty.'}, status=status.HTTP_400_BAD_REQUEST)
                subtotal = sum(float(item.product.price) * item.quantity for item in cart_items)
                shipping_cost = 0  # Calculate as needed
                discount_amount = 0  # Calculate as needed
                total_price = subtotal + shipping_cost - discount_amount
                order = Order.objects.create(
                    user=request.user,
                    subtotal=subtotal,
                    shipping_cost=shipping_cost,
                    discount_amount=discount_amount,
                    total_price=total_price,
                    shipping_first_name=shipping.get('first_name', ''),
                    shipping_last_name=shipping.get('last_name', ''),
                    shipping_email=shipping.get('email', ''),
                    shipping_phone=shipping.get('phone', ''),
                    shipping_address=shipping.get('address', ''),
                    shipping_city=shipping.get('city', ''),
                    shipping_governorate=shipping.get('governorate', ''),
                    shipping_postal_code=shipping.get('postal_code', ''),
                    payment_method=payment_method,
                )
                for item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=item.product,
                        color_variant=item.color_variant,
                        size=item.size,
                        quantity=item.quantity,
                        unit_price=item.product.price,
                        total_price=float(item.product.price) * item.quantity
                    )
                cart_items.delete()
                serializer = self.get_serializer(order)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            print(f'Order place error: {e}')
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 