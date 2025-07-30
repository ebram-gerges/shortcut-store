# products/urls.py
from django.urls import path
from . import views
from .api_views import submit_question

urlpatterns = [
    path('', views.product_list, name='product_list'),
    path('<int:product_id>/', views.product_detail, name='product_detail'),
    path('<int:product_id>/color/<str:color>/', views.get_color_variant_images, name='color_variant_images'),
    path('<int:product_id>/stock/<str:color>/<str:size>/', views.get_stock_status, name='get_stock_status'),
    path('add-to-cart/', views.add_to_cart, name='add_to_cart'),
    path('add-to-wishlist/', views.add_to_wishlist, name='add_to_wishlist'),
    path('get-wishlist/', views.get_wishlist, name='get_wishlist'),
    path('get-cart/', views.get_cart, name='get_cart'),
    path('remove-from-cart/', views.remove_from_cart, name='remove_from_cart'),
    path('update-cart-quantity/', views.update_cart_quantity, name='update_cart_quantity'),
    path('admin/bulk-upload-color-variant-images/', views.bulk_upload_color_variant_images, name='bulk_upload_color_variant_images'),
]

urlpatterns += [
    path('questions/submit/', submit_question, name='submit_question'),
]
