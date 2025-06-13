from django.urls import path
from . import views

urlpatterns = [
    path('', views.view_cart, name='view_cart'),
    path('add/', views.add_to_cart, name='add_to_cart'),
    path('remove/', views.remove_from_cart, name='remove_from_cart'),
    path('update-quantity/', views.update_cart_quantity, name='update_cart_quantity'),
    path('get-cart/', views.get_cart, name='get_cart'),
]