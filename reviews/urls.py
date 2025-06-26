from django.urls import path, include
from . import views

urlpatterns = [
    path('product/<int:product_id>/reviews/', views.product_reviews, name='product_reviews'),
    path('product/<int:product_id>/add-review/', views.add_review, name='add_review'),
    path('', include('reviews.api_urls')),
]