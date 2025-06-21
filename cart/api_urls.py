from django.urls import path
from . import api_views

urlpatterns = [
    path('', api_views.get_cart_view, name='api_get_cart'),
    path('add/', api_views.add_to_cart_view, name='api_add_to_cart'),
    path('items/<int:item_id>/', api_views.update_cart_item_view, name='api_update_cart_item'),
    path('items/<int:item_id>/remove/', api_views.remove_from_cart_view, name='api_remove_from_cart'),
    path('clear/', api_views.clear_cart_view, name='api_clear_cart'),
    path('count/', api_views.cart_count_view, name='api_cart_count'),
]
