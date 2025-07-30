from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.urlpatterns import format_suffix_patterns
from django.urls import path, re_path, include
from .api_views import (
    ProductViewSet, collection_images_list,
    get_site_announcement, submit_question, test_simple
)

# Create a router and register our viewsets with it
router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
    path('collection-images/', collection_images_list, name='collection-images-list'),
    # Backward compatibility: allow lookup by id as well
    re_path(r'^products/(?P<pk>\d+)/$', ProductViewSet.as_view({'get': 'retrieve'}), name='product-detail-by-id'),
]

urlpatterns += [
    path('site-announcement/', get_site_announcement, name='site-announcement'),
    path('products/questions/submit/', submit_question, name='submit-question'),
    path('test/', test_simple, name='test_simple'),
]
