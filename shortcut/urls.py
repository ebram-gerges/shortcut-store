from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from products.api import ProductViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'api/products', ProductViewSet, basename='api-products')

def checkout_redirect(request):
    """Redirect /checkout/ to /orders/checkout/"""
    return redirect('orders:checkout')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
    path('accounts/', include('accounts.urls')),
    path('auth/', include('allauth.urls')),  # Google OAuth URLs
    path('products/', include('products.urls')),
    path('cart/', include('cart.urls')),
    path('wishlist/', include('wishlist.urls')),
    path('reviews/', include('reviews.urls')),
    path('vouchers/', include('vouchers.urls')),
    path('orders/', include('orders.urls')),
    path('checkout/', checkout_redirect, name='checkout_redirect'),  # Direct checkout URL
    path('', include('landing.urls')),  # If you have a landing app
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)