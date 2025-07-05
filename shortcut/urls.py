from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.api_views import MyTokenObtainPairView
from core.healthcheck import healthcheck

urlpatterns = [
    path('admin/django_attach/', include('django_attach.urls')),
    path('admin/', admin.site.urls),
    path('accounts/', include('allauth.urls')),  # Allauth URLs
    path('accounts/', include('accounts.urls')),
    path('auth/', include('allauth.urls')),  # Google OAuth URLs
    path('products/', include('products.urls')),
    path('cart/', include('cart.urls')),
    path('wishlist/', include('wishlist.urls')),
    path('reviews/', include('reviews.urls')),
    path('vouchers/', include('vouchers.urls')),
    # path('orders/', include('orders.urls')),  # Removed to fix namespace conflict

    # API URLs
    path('api/', include('products.api_urls')),
    path('api/accounts/', include('accounts.api_urls')),
    path('api/cart/', include('cart.api_urls')),
    path('api/', include('reviews.api_urls')),
    path('api/orders/', include('orders.urls')),
    path('api/vouchers/', include('vouchers.api_urls')),

    # JWT token endpoints (root-level) for SPA convenience
    path('api/token/', MyTokenObtainPairView.as_view(), name='jwt_token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='jwt_token_refresh'),

    path('healthz/', healthcheck, name='healthcheck'),
    path('', include('landing.urls')),  # If you have a landing app
]

# Serve React build files
if not settings.DEBUG:
    # Catch all other routes and return the React app
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
    ]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)