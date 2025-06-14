from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .api import WishlistViewSet

router = DefaultRouter()
router.register(r'api/wishlist', WishlistViewSet, basename='api-wishlist')

urlpatterns = [
    path('', views.view_wishlist, name='view_wishlist'),
    path('add/', views.add_to_wishlist, name='add_to_wishlist'),
    path('remove/', views.remove_from_wishlist, name='remove_from_wishlist'),
    path('get-wishlist/', views.get_wishlist, name='get_wishlist'),
    path('', include(router.urls)),
]