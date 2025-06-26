from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .api_views import MyTokenObtainPairView
from . import api_views

urlpatterns = [
    # JWT Token endpoints
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User authentication
    path('register/', api_views.register_view, name='api_register'),
    path('login/', api_views.login_view, name='api_login'),
    
    # User profile
    path('profile/', api_views.UserProfileView.as_view(), name='api_profile'),
    path('user/', api_views.user_detail_view, name='api_user_detail'),
    
    # Password management
    path('change-password/', api_views.change_password_view, name='api_change_password'),
    
    # Email verification
    path('verify-email/', api_views.verify_email_view, name='api_verify_email'),
    path('resend-verification/', api_views.resend_verification_view, name='api_resend_verification'),
]
