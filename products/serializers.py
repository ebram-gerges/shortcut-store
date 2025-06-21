from rest_framework import serializers
from .models import Product, ProductColorVariant, ProductVariant, ProductStock, ProductColorVariantImage


class ProductColorVariantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColorVariantImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']


class ProductColorVariantSerializer(serializers.ModelSerializer):
    images = ProductColorVariantImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductColorVariant
        fields = ['id', 'color', 'color_hex', 'stock', 'is_active', 'images']


class ProductVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductVariant
        fields = ['id', 'size', 'stock', 'is_active']


class ProductStockSerializer(serializers.ModelSerializer):
    color_variant = ProductColorVariantSerializer(read_only=True)
    
    class Meta:
        model = ProductStock
        fields = [
            'id', 'color_variant', 'size', 'quantity', 'reserved_quantity',
            'available_quantity', 'stock_status', 'is_active'
        ]


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for product list view with minimal data"""
    discounted_price = serializers.ReadOnlyField()
    available_colors = serializers.ReadOnlyField()
    available_sizes = serializers.ReadOnlyField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'price', 'discounted_price', 'sale_percent',
            'image', 'category', 'created_at', 'available_colors', 'available_sizes'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed product view"""
    discounted_price = serializers.ReadOnlyField()
    available_colors = serializers.ReadOnlyField()
    available_sizes = serializers.ReadOnlyField()
    color_variants = ProductColorVariantSerializer(many=True, read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    stock_items = ProductStockSerializer(many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'discounted_price', 'sale_percent',
            'stock', 'image', 'category', 'created_at', 'available_colors', 
            'available_sizes', 'color_variants', 'variants', 'stock_items'
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products (admin only)"""
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'sale_percent', 'stock', 
            'image', 'category'
        ]
        
    def validate_sale_percent(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Sale percent must be between 0 and 100")
        return value
