from django.contrib import admin
from .models import Voucher

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_percent', 'is_active', 'created_at')
    readonly_fields = ('code',)
