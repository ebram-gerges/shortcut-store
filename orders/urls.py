from django.urls import path
from . import views

app_name = 'orders'

urlpatterns = [
    path('place/', views.place_order, name='place_order'),
    path('summary/<int:order_id>/', views.order_summary, name='order_summary'),
]
