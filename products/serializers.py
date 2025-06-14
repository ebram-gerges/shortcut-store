from rest_framework import serializers
from .models import Product, ProductColorVariant

class ProductColorVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductColorVariant
        fields = ['id', 'color', 'is_active']

class ProductSerializer(serializers.ModelSerializer):
    color_variants = ProductColorVariantSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'description', 'price', 'sale_percent',
            'image', 'category', 'color_variants', 'is_active', 'created_at'
        ] 