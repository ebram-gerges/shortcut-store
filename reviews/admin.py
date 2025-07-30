from django.contrib import admin
from .models import ProductReview, WebsiteReview

class ReviewAdmin(admin.ModelAdmin):
    list_display = ('user', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'comment')

@admin.register(ProductReview)
class ProductReviewAdmin(ReviewAdmin):
    list_display = ('user', 'product', 'rating', 'created_at')
    list_filter = ('product', 'rating', 'created_at')
    search_fields = ('user__username', 'product__name', 'comment')

@admin.register(WebsiteReview)
class WebsiteReviewAdmin(ReviewAdmin):
    pass
