from rest_framework import serializers
from .models import ProductReview, WebsiteReview

class ProductReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductReview
        fields = '__all__'

class WebsiteReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = WebsiteReview
        fields = '__all__'