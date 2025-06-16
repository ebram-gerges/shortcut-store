# products/admin.py
from django.contrib import admin
from .models import Product, ProductVariant, ProductColorVariant, ProductColorVariantImage, ProductStock, CollectionImage

class ProductColorVariantImageInline(admin.TabularInline):
    model = ProductColorVariantImage
    extra = 2
    fields = ('image', 'alt_text', 'is_primary', 'order')
    ordering = ['order']

class ProductColorVariantInline(admin.StackedInline):
    model = ProductColorVariant
    extra = 1
    fields = ('color', 'color_hex', 'stock', 'is_active')
    inlines = [ProductColorVariantImageInline]

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1
    fields = ('size', 'stock', 'is_active')

class ProductStockInline(admin.TabularInline):
    model = ProductStock
    extra = 0
    fields = ('color_variant', 'size', 'quantity', 'reserved_quantity', 'is_active')
    readonly_fields = ('available_quantity', 'stock_status', 'stock_display')

    def available_quantity(self, obj):
        return obj.available_quantity if obj else 0
    available_quantity.short_description = 'Available'

    def stock_status(self, obj):
        return obj.stock_status if obj else 'unknown'
    stock_status.short_description = 'Status'

    def stock_display(self, obj):
        return obj.stock_display if obj else 'N/A'
    stock_display.short_description = 'Display'

class ProductColorVariantAdmin(admin.ModelAdmin):
    list_display = ('product', 'color', 'stock', 'is_active', 'created_at')
    list_filter = ('color', 'is_active', 'created_at')
    search_fields = ('product__name', 'color')
    inlines = [ProductColorVariantImageInline]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('product')

class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'price', 'sale_percent', 'stock', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description')
    inlines = [ProductColorVariantInline, ProductVariantInline, ProductStockInline]

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'category', 'image')
        }),
        ('Pricing', {
            'fields': ('price', 'sale_percent')
        }),
        ('Inventory', {
            'fields': ('stock',)
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if not request.user.is_superuser:
            return ['sale_percent']
        return []

class ProductColorVariantImageAdmin(admin.ModelAdmin):
    list_display = ('color_variant', 'is_primary', 'order', 'created_at')
    list_filter = ('is_primary', 'created_at')
    search_fields = ('color_variant__product__name', 'color_variant__color', 'alt_text')
    ordering = ['color_variant', 'order']

class ProductStockAdmin(admin.ModelAdmin):
    list_display = ('product', 'color_variant', 'size', 'quantity', 'reserved_quantity', 'available_quantity', 'stock_status', 'is_active')
    list_filter = ('color_variant__color', 'size', 'is_active', 'created_at')
    search_fields = ('product__name', 'color_variant__color')
    list_editable = ('quantity', 'is_active')

    def available_quantity(self, obj):
        return obj.available_quantity
    available_quantity.short_description = 'Available'

    def stock_status(self, obj):
        status = obj.stock_status
        colors = {
            'in_stock': 'green',
            'low_stock': 'orange',
            'out_of_stock': 'red'
        }
        return f'<span style="color: {colors.get(status, "black")};">{status.replace("_", " ").title()}</span>'
    stock_status.short_description = 'Status'
    stock_status.allow_tags = True


@admin.register(CollectionImage)
class CollectionImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active', 'order', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title',)
    list_editable = ('is_active', 'order')
    ordering = ['order', 'created_at']

    fieldsets = (
        (None, {
            'fields': ('image', 'title', 'is_active', 'order')
        }),
    )


# Register models
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductColorVariant, ProductColorVariantAdmin)
admin.site.register(ProductColorVariantImage, ProductColorVariantImageAdmin)
admin.site.register(ProductStock, ProductStockAdmin)
