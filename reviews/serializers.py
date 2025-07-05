from rest_framework import serializers
from .models import ProductReview, WebsiteReview, ProductPhoto
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'avatar_color']

class ProductReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_avatar = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = ProductReview
        fields = ['id', 'product', 'user', 'user_avatar', 'username', 'rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_user_avatar(self, obj):
        if hasattr(obj.user, 'avatar') and obj.user.avatar:
            return obj.user.avatar.url
        return None

    def get_username(self, obj):
        return obj.user.username

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class WebsiteReviewSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_avatar = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()

    class Meta:
        model = WebsiteReview
        fields = ['id', 'user', 'user_avatar', 'username', 'rating', 'experience_rating', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']

    def get_user_avatar(self, obj):
        if hasattr(obj.user, 'avatar') and obj.user.avatar:
            return obj.user.avatar.url
        return None

    def get_username(self, obj):
        return obj.user.username

    def validate_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5")
        return value

    def validate_experience_rating(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("Experience rating must be between 1 and 5")
        return value

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class ProductPhotoSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_avatar = serializers.SerializerMethodField()
    username = serializers.SerializerMethodField()
    review = serializers.PrimaryKeyRelatedField(queryset=ProductReview.objects.all(), required=False, allow_null=True)

    class Meta:
        model = ProductPhoto
        fields = ['id', 'product', 'user', 'user_avatar', 'username', 'photo', 'caption', 'created_at', 'is_approved', 'review']
        read_only_fields = ['user', 'created_at', 'is_approved']

    def get_user_avatar(self, obj):
        if hasattr(obj.user, 'avatar') and obj.user.avatar:
            return obj.user.avatar.url
        return None

    def get_username(self, obj):
        return obj.user.username

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data) 