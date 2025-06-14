# products/admin.py
from django.contrib import admin
from .models import Product, ProductImage

class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order')
    ordering = ['order']

class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'sale_percent', 'stock', 'created_at', 'is_active')
    list_filter = ('category', 'created_at', 'is_active')
    search_fields = ('name', 'description')
    inlines = [ProductImageInline]
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'is_active')
        }),
        ('Pricing', {
            'fields': ('price', 'sale_percent')
        }),
        ('Inventory', {
            'fields': ('stock',)
        }),
    )

admin.site.register(Product, ProductAdmin)
admin.site.register(ProductImage)
