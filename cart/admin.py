from django.contrib import admin
from .models import CartItem

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('get_user_identifier', 'product', 'color_variant', 'size', 'quantity', 'total_price', 'created_at')
    list_filter = ('created_at', 'color_variant__color', 'size')
    search_fields = ('product__name', 'user__username', 'session_key')
    readonly_fields = ('created_at', 'updated_at', 'total_price')

    def get_user_identifier(self, obj):
        return obj.user.username if obj.user else f"Session: {obj.session_key[:8]}..."
    get_user_identifier.short_description = 'User/Session'
