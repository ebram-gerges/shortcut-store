from rest_framework import serializers
from .models import CartItem
from products.serializers import ProductListSerializer, ProductColorVariantSerializer


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)
    color_variant = ProductColorVariantSerializer(read_only=True)
    total_price = serializers.ReadOnlyField()
    
    class Meta:
        model = CartItem
        fields = [
            'id', 'product', 'color_variant', 'size', 'quantity', 
            'total_price', 'created_at', 'updated_at'
        ]


class AddToCartSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    color = serializers.CharField(max_length=50, required=False)
    size = serializers.CharField(max_length=10, required=False)
    quantity = serializers.IntegerField(min_value=1, default=1)
    
    def validate_product_id(self, value):
        from products.models import Product
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist")
        return value
    
    def validate(self, attrs):
        from products.models import Product, ProductColorVariant, ProductStock
        
        product_id = attrs['product_id']
        color = attrs.get('color')
        size = attrs.get('size')
        quantity = attrs['quantity']
        
        product = Product.objects.get(id=product_id)
        
        # If color is specified, validate it exists
        color_variant = None
        if color:
            try:
                color_variant = product.color_variants.get(color=color)
            except ProductColorVariant.DoesNotExist:
                raise serializers.ValidationError(f"Color '{color}' not available for this product")
        
        # If both color and size are specified, check stock
        if color_variant and size:
            try:
                stock_item = ProductStock.objects.get(
                    product=product,
                    color_variant=color_variant,
                    size=size
                )
                if stock_item.available_quantity < quantity:
                    raise serializers.ValidationError(
                        f"Only {stock_item.available_quantity} items available in stock"
                    )
            except ProductStock.DoesNotExist:
                raise serializers.ValidationError(
                    f"Size '{size}' not available for color '{color}'"
                )
        
        attrs['product'] = product
        attrs['color_variant'] = color_variant
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    quantity = serializers.IntegerField(min_value=1)
    
    def validate_quantity(self, value):
        cart_item = self.instance
        if cart_item:
            stock_item = cart_item.get_stock_item()
            if stock_item and stock_item.available_quantity < value:
                raise serializers.ValidationError(
                    f"Only {stock_item.available_quantity} items available in stock"
                )
        return value


class CartSummarySerializer(serializers.Serializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.IntegerField(read_only=True)
    total_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    
    def to_representation(self, instance):
        # instance should be a queryset of CartItems
        items = instance
        total_items = sum(item.quantity for item in items)
        total_price = sum(item.total_price for item in items)
        
        return {
            'items': CartItemSerializer(items, many=True).data,
            'total_items': total_items,
            'total_price': total_price
        }
