# accounts/urls.py
from django.urls import path
from . import views

app_name = 'accounts'

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('verify-email/', views.verify_email_view, name='verify_email'),
    path('verify-email/<int:user_id>/', views.verify_email_view, name='verify_email_with_id'),
    path('resend-verification/', views.resend_verification_code, name='resend_verification'),
    path('profile/', views.profile_view, name='profile'),
]
