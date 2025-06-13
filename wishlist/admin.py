from django.contrib import admin
from .models import WishlistItem

@admin.register(WishlistItem)
class WishlistItemAdmin(admin.ModelAdmin):
    list_display = ('get_user_identifier', 'product', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('product__name', 'user__username', 'session_key')
    readonly_fields = ('added_at',)

    def get_user_identifier(self, obj):
        return obj.user.username if obj.user else f"Session: {obj.session_key[:8]}..."
    get_user_identifier.short_description = 'User/Session'
