from django.contrib import admin
from .models import Voucher
from django import forms
from products.models import Product

class VoucherAdminForm(forms.ModelForm):
    categories = forms.ChoiceField(
        choices=Product.CATEGORY_CHOICES,
        required=False,
        help_text="Select a category for this voucher."
    )

    class Meta:
        model = Voucher
        fields = '__all__'

@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    form = VoucherAdminForm
    list_display = (
        'code', 'discount_percent', 'is_active', 'expiry_date',
        'use_once_per_user', 'require_previous_order', 'categories', 'created_at'
    )
    search_fields = ('code',)
    list_filter = ('is_active', 'use_once_per_user', 'require_previous_order', 'categories')
    fieldsets = (
        (None, {
            'fields': ('code', 'discount_percent', 'is_active', 'expiry_date', 'created_at')
        }),
        ('Rules', {
            'fields': ('use_once_per_user', 'require_previous_order', 'categories'),
            'classes': ('collapse',)
        }),
    )
    # No readonly_fields, all fields are editable
