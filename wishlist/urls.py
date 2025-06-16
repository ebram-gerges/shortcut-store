from django.urls import path
from . import views
from django.shortcuts import render, redirect, get_object_or_404
# Import the Wishlist class here
from .models import WishlistItem  # Add this line at the beginning

def view_wishlist(request):
    wishlist = WishlistItem.objects.filter(user=request.user)
    return render(request, 'wishlist/wishlist.html', {'wishlist': wishlist})

urlpatterns = [
    path('', views.view_wishlist, name='view_wishlist'),
    path('add/<int:product_id>/', views.add_to_wishlist, name='add_to_wishlist'),
    path('remove/<int:item_id>/', views.remove_from_wishlist, name='remove_from_wishlist'),
]