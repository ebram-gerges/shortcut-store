from django.contrib import admin
from .models import Order, OrderItem
from django.urls import path
from django.utils.html import format_html
from django.shortcuts import redirect
from django.urls import reverse

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product', 'quantity', 'price', 'color', 'size')

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'serial', 'user', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    list_editable = ('status',)
    search_fields = ('user__username', 'serial')
    inlines = [OrderItemInline]
    change_form_template = 'admin/orders/order/change_form.html'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:order_id>/download-pdf/', self.admin_site.admin_view(self.download_pdf), name='orders_order_download_pdf'),
        ]
        return custom_urls + urls

    def download_pdf(self, request, order_id):
        from .views import download_order_pdf
        return download_order_pdf(request, order_id)

admin.site.register(OrderItem)
