from rest_framework import serializers
from .models import Product, ProductColorVariant, ProductSizeVariant, ProductStock, ProductColorVariantImage, CollectionImage, CollectionGalleryImage, Category


class ProductColorVariantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColorVariantImage
        fields = ['id', 'image', 'alt_text', 'created_at']


class ProductColorVariantSerializer(serializers.ModelSerializer):
    images = ProductColorVariantImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProductColorVariant
        fields = ['id', 'color', 'color_hex', 'is_active', 'images']


class ProductSizeVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSizeVariant
        fields = ['id', 'size', 'stock', 'is_active']


class ProductStockSerializer(serializers.ModelSerializer):
    color_variant = ProductColorVariantSerializer(source='size_variant.color_variant', read_only=True)
    size = serializers.SerializerMethodField()

    def get_size(self, obj):
        return obj.size_variant.size if obj.size_variant else None
    
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
    in_stock = serializers.SerializerMethodField()
    indoor_image = serializers.ImageField(read_only=True)
    outdoor_image = serializers.ImageField(read_only=True)
    color_variants = ProductColorVariantSerializer(many=True, read_only=True)
    rating = serializers.FloatField(read_only=True)
    slug = serializers.SlugField(read_only=True)

    def get_in_stock(self, obj):
        # Consider in stock if any stock_items have available_quantity > 0
        return obj.stock_items.filter(quantity__gt=0).exists()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'price', 'discounted_price', 'sale_percent',
            'indoor_image', 'outdoor_image', 'category', 'created_at', 'available_colors', 'available_sizes', 'in_stock', 'color_variants', 'rating'
        ]


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed product view"""
    discounted_price = serializers.ReadOnlyField()
    available_colors = serializers.ReadOnlyField()
    available_sizes = serializers.ReadOnlyField()
    color_variants = ProductColorVariantSerializer(many=True, read_only=True)
    stock_items = ProductStockSerializer(many=True, read_only=True)
    in_stock = serializers.SerializerMethodField()
    indoor_image = serializers.ImageField(read_only=True)
    outdoor_image = serializers.ImageField(read_only=True)
    rating = serializers.FloatField(read_only=True)
    slug = serializers.SlugField(read_only=True)

    def get_in_stock(self, obj):
        return obj.stock_items.filter(quantity__gt=0).exists()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'discounted_price', 'sale_percent',
            'indoor_image', 'outdoor_image', 'category', 'created_at', 'available_colors', 
            'available_sizes', 'color_variants', 'stock_items', 'in_stock', 'rating'
        ]


class ProductCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products (admin only)"""
    
    class Meta:
        model = Product
        fields = [
            'name', 'description', 'price', 'sale_percent', 
            'category', 'outdoor_image'
        ]
        
    def validate_sale_percent(self, value):
        if value is not None and (value < 0 or value > 100):
            raise serializers.ValidationError("Sale percent must be between 0 and 100")
        return value


class CollectionGalleryImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CollectionGalleryImage
        fields = ['id', 'image', 'order', 'created_at']


class CollectionImageSerializer(serializers.ModelSerializer):
    images = CollectionGalleryImageSerializer(many=True, read_only=True)
    class Meta:
        model = CollectionImage
        fields = ['id', 'title', 'image', 'order', 'is_active', 'created_at', 'images']
