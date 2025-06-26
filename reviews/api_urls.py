from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ProductReviewViewSet, WebsiteReviewViewSet, ProductPhotoViewSet

router = DefaultRouter()
router.register(r'product-reviews', ProductReviewViewSet, basename='product-review')
router.register(r'website-reviews', WebsiteReviewViewSet, basename='website-review')
router.register(r'product-photos', ProductPhotoViewSet, basename='product-photo')

urlpatterns = router.urls 