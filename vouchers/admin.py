from django.contrib import admin
from .models import Voucher
from django import forms
from products.models import Product, Category

class VoucherAdminForm(forms.ModelForm):
    class Meta:
        model = Voucher
        fields = '__all__'

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    form = VoucherAdminForm
    list_display = (
        'code', 'discount_percent', 'is_active', 'expiry_date',
        'use_once_per_user', 'require_previous_order', 'categories_display', 'created_at'
    )
    search_fields = ('code',)
    list_filter = ('is_active', 'use_once_per_user', 'require_previous_order', 'categories', 'created_at')
    fieldsets = (
        (None, {
            'fields': ('code', 'discount_percent', 'is_active', 'expiry_date', 'created_at')
        }),
        ('Rules', {
            'fields': ('use_once_per_user', 'require_previous_order', 'categories'),
            'classes': ('collapse',)
        }),
    )
    readonly_fields = ('categories_display',)
    
    def categories_display(self, obj):
        if obj.categories.exists():
            return ', '.join(obj.categories.values_list('name', flat=True))
        return 'All Categories'
    categories_display.short_description = 'Categories'
