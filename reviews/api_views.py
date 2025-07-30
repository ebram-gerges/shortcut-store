from rest_framework import generics, permissions
from .models import ProductReview, WebsiteReview
from .serializers import ProductReviewSerializer, WebsiteReviewSerializer

class ProductReviewList(generics.ListAPIView):
    serializer_class = ProductReviewSerializer

    def get_queryset(self):
        product_id = self.kwargs['product_id']
        return ProductReview.objects.filter(product_id=product_id)

class WebsiteReviewList(generics.ListAPIView):
    queryset = WebsiteReview.objects.all()
    serializer_class = WebsiteReviewSerializer

class ReviewCreate(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if 'product' in self.request.data:
            return ProductReviewSerializer
        return WebsiteReviewSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)