from django.urls import path
from .api_views import ProductReviewList, WebsiteReviewList, ReviewCreate

urlpatterns = [
    path('reviews/product/<int:product_id>/', ProductReviewList.as_view(), name='product-review-list'),
    path('reviews/website/', WebsiteReviewList.as_view(), name='website-review-list'),
    path('reviews/create/', ReviewCreate.as_view(), name='review-create'),
]