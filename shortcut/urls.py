from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),  # Allauth URLs
    path('accounts/', include('accounts.urls')),
    path('auth/', include('allauth.urls')),  # Google OAuth URLs
    path('products/', include('products.urls')),
    path('cart/', include('cart.urls')),
    path('wishlist/', include('wishlist.urls')),
    path('reviews/', include('reviews.urls')),
    path('vouchers/', include('vouchers.urls')),
    path('orders/', include('orders.urls')),

    # API URLs
    path('api/', include('products.api_urls')),
    path('api/accounts/', include('accounts.api_urls')),
    path('api/cart/', include('cart.api_urls')),

    # JWT token endpoints (root-level) for SPA convenience
    path('api/token/', TokenObtainPairView.as_view(), name='jwt_token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='jwt_token_refresh'),

    path('', include('landing.urls')),  # If you have a landing app
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)