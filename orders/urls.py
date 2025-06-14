from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .api import OrderViewSet

router = DefaultRouter()
router.register(r'api/orders', OrderViewSet, basename='api-orders')

app_name = 'orders'

urlpatterns = [
    path('checkout/', views.checkout, name='checkout'),
    path('place/', views.place_order, name='place_order'),
    path('summary/<int:order_id>/', views.order_summary, name='order_summary'),
    path('', include(router.urls)),
]
