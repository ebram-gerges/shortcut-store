from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import ProductReview, WebsiteReview, ProductPhoto
from .serializers import ProductReviewSerializer, WebsiteReviewSerializer, ProductPhotoSerializer
from products.models import Product
from rest_framework import serializers

class ProductReviewViewSet(viewsets.ModelViewSet):
    queryset = ProductReview.objects.select_related('user', 'product').all()
    serializer_class = ProductReviewSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow public access for reading reviews
            return [permissions.AllowAny()]
        # Require authentication for create, update, delete
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return ProductReview.objects.select_related('user', 'product').filter(product_id=product_id)
        return ProductReview.objects.select_related('user', 'product').all()

    def perform_create(self, serializer):
        product_id = self.request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(user=self.request.user, product=product)

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        reviews = ProductReview.objects.select_related('user', 'product').filter(user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['put', 'patch'])
    def update_review(self, request, pk=None):
        review = self.get_object()
        if review.user != request.user:
            return Response({'error': 'You can only update your own reviews'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class WebsiteReviewViewSet(viewsets.ModelViewSet):
    queryset = WebsiteReview.objects.select_related('user').all()
    serializer_class = WebsiteReviewSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow public access for reading reviews
            return [permissions.AllowAny()]
        # Require authentication for create, update, delete
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'])
    def my_reviews(self, request):
        reviews = WebsiteReview.objects.select_related('user').filter(user=request.user)
        serializer = self.get_serializer(reviews, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['put', 'patch'])
    def update_review(self, request, pk=None):
        review = self.get_object()
        if review.user != request.user:
            return Response({'error': 'You can only update your own reviews'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProductPhotoViewSet(viewsets.ModelViewSet):
    queryset = ProductPhoto.objects.select_related('user', 'product').filter(is_approved=True)
    serializer_class = ProductPhotoSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            # Allow public access for reading photos
            return [permissions.AllowAny()]
        # Require authentication for create, update, delete
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        product_id = self.request.query_params.get('product_id')
        if product_id:
            return ProductPhoto.objects.select_related('user', 'product').filter(product_id=product_id, is_approved=True)
        return ProductPhoto.objects.select_related('user', 'product').filter(is_approved=True)

    def perform_create(self, serializer):
        product_id = self.request.data.get('product')
        product = get_object_or_404(Product, id=product_id)
        serializer.save(user=self.request.user, product=product)

    @action(detail=False, methods=['get'])
    def my_photos(self, request):
        photos = ProductPhoto.objects.select_related('user', 'product').filter(user=request.user)
        serializer = self.get_serializer(photos, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['put', 'patch'])
    def update_photo(self, request, pk=None):
        try:
            photo = self.get_object()
            if photo.user != request.user:
                return Response({'error': 'You can only update your own photos'}, status=status.HTTP_403_FORBIDDEN)
            
            serializer = self.get_serializer(photo, data=request.data, partial=True)
            if serializer.is_valid():
                updated_photo = serializer.save()
                return Response(serializer.data)
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 