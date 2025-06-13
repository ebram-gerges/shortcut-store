from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect

def checkout_redirect(request):
    """Redirect /checkout/ to /orders/checkout/"""
    return redirect('orders:checkout')

urlpatterns = [
    path('admin/', admin.site.urls),
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