from django.urls import path
from .api_views import apply_voucher

urlpatterns = [
    # ... other voucher API endpoints ...
    path('apply/', apply_voucher, name='voucher-apply'),
] 