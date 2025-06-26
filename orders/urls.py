from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('place/', views.place_order, name='place_order'),
    path('summary/<int:order_id>/', views.order_summary, name='order_summary'),
    path('user-orders/', views.user_orders, name='user_orders'),
    path('order-by-serial/', views.order_by_serial, name='order_by_serial'),
    path('test-error/', views.test_error, name='test_error'),
]
