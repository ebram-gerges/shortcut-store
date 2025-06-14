# accounts/urls.py
from django.urls import path, include
from . import views
from rest_framework.routers import DefaultRouter
from .api import UserViewSet, RegisterView

app_name = 'accounts'

router = DefaultRouter()
router.register(r'api/user', UserViewSet, basename='api-user')

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('verify-email/', views.verify_email_view, name='verify_email'),
    path('verify-email/<int:user_id>/', views.verify_email_view, name='verify_email_with_id'),
    path('resend-verification/', views.resend_verification_code, name='resend_verification'),
    path('password-reset/', views.password_reset_view, name='password_reset'),
    path('password-reset-confirm/<int:user_id>/', views.password_reset_confirm_view, name='password_reset_confirm'),
    path('profile/', views.profile_view, name='profile'),
    path('api/register/', RegisterView.as_view(), name='api-register'),
    path('', include(router.urls)),
]
