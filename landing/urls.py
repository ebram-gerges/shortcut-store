from django.urls import path
from . import views

urlpatterns = [
    path('', views.landing_page, name='landing'),
    path('store/', views.shortcut_store, name='shortcut_store'),
]
