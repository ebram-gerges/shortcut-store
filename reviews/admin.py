from django.contrib import admin
from .models import ProductReview, WebsiteReview, ProductPhoto

@admin.register(ProductReview)
class ProductReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'rating', 'created_at']
    list_filter = ['rating', 'created_at', 'product']
    search_fields = ['user__username', 'product__name', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

@admin.register(WebsiteReview)
class WebsiteReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'rating', 'experience_rating', 'created_at']
    list_filter = ['rating', 'experience_rating', 'created_at']
    search_fields = ['user__username', 'comment']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

@admin.register(ProductPhoto)
class ProductPhotoAdmin(admin.ModelAdmin):
    list_display = ['user', 'product', 'is_approved', 'created_at']
    list_filter = ['is_approved', 'created_at', 'product']
    search_fields = ['user__username', 'product__name', 'caption']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    actions = ['approve_photos', 'disapprove_photos']

    def approve_photos(self, request, queryset):
        queryset.update(is_approved=True)
    approve_photos.short_description = "Approve selected photos"

    def disapprove_photos(self, request, queryset):
        queryset.update(is_approved=False)
    disapprove_photos.short_description = "Disapprove selected photos"
