from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .api_views import ProductViewSet, collection_images_list, category_images_list

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('collection-images/', collection_images_list, name='collection-images-list'),
    path('category-images/', category_images_list, name='category-images-list'),
]
