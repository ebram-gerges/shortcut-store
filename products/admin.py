# products/admin.py
from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.contrib.admin import ModelAdmin, TabularInline, StackedInline
from django.contrib.admin.views.decorators import staff_member_required
from .models import Product, ProductColorVariant, ProductColorVariantImage, ProductSizeVariant, ProductStock, CollectionImage, CollectionGalleryImage, Category, SiteAnnouncement
from django.urls import path
from django.http import JsonResponse
import logging
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.admin import AdminSite
import nested_admin
from django.forms.widgets import FileInput
from .forms import ProductColorVariantAdminForm, ProductColorVariantBulkImageUploadForm
from django.shortcuts import render, redirect
from django.urls import path
from django.contrib import messages

# Nested Inline for images under color variant
class ProductColorVariantImageInline(nested_admin.NestedTabularInline):
    model = ProductColorVariantImage
    extra = 0
    fields = ('image', 'alt_text')  # Restore default fields
    # Remove any custom save_new_objects or multi_images logic

# Nested Inline for size variants under color variant
class ProductSizeVariantInline(nested_admin.NestedStackedInline):
    model = ProductSizeVariant
    extra = 1
    fieldsets = (
        ('Sizes for this Color', {
            'classes': ('collapse',),
            'fields': ('size', 'stock', 'is_active'),
            'description': 'Add or edit sizes for this color variant.'
        }),
    )
    readonly_fields = ()
    ordering_field = None  # Unfold compatibility
    
    def formfield_for_dbfield(self, db_field, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, **kwargs)
        if db_field.name == 'stock':
            formfield.help_text = "This is the ONLY stock field to edit. It controls the available stock for this size and color."
        return formfield

# Nested Inline for color variants under product
class ProductColorVariantInline(nested_admin.NestedStackedInline):
    model = ProductColorVariant
    form = ProductColorVariantAdminForm
    extra = 0
    readonly_fields = ('display_images',)
    ordering_field = None  # Unfold compatibility
    inlines = [ProductColorVariantImageInline]  # Restore default image inline

    def get_fieldsets(self, request, obj=None):
        return [
            ('Color Variant Details', {
                'fields': [
                    'color', 'color_hex', 'is_active', 'sizes',
                    'stock_M', 'stock_L', 'stock_XL', 'stock_2XL',
                ],
                'description': 'Set the color, hex code, activation, sizes, and stock for this variant.'
            }),
        ]

    def display_images(self, obj):
        images = obj.images.all() if obj and obj.pk else []
        html = '''<div style="margin-bottom:8px;font-weight:bold;font-size:17px;letter-spacing:0.5px;">Image Gallery</div>'''
        html += '<div id="existing-image-gallery" style="display:flex;flex-wrap:wrap;gap:18px;">'
        for img in images:
            html += f'''
            <div data-image-id="{img.id}" style="position:relative;display:flex;align-items:center;justify-content:center;transition:box-shadow 0.2s;box-shadow:0 4px 16px #0002;border-radius:12px;border:2px solid #e0e0e0;overflow:hidden;background:#fafbfc;padding:10px;max-width:220px;max-height:220px;">
                <img src="{img.image.url}" style="display:block;max-width:200px;max-height:200px;width:auto;height:auto;border-radius:8px;transition:transform 0.2s;object-fit:contain;background:#f5f5f5;">
                <button type="button" class="delete-image-btn" data-image-id="{img.id}" style="position:absolute;top:8px;right:8px;background:#d32f2f;color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;z-index:2;font-size:20px;box-shadow:0 2px 8px #0003;opacity:0.92;">&times;</button>
            </div>
            '''
        html += '</div>'
        # Replace the custom-upload-area with a button linking to the bulk upload page
        html += f'''
        <div style="margin-top:18px;text-align:center;">
            <a href="/admin/products/productcolorvariant/action/bulk-upload-images/" target="_blank" style="display:inline-block;font-size:16px;padding:12px 28px;background:#1976d2;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;box-shadow:0 2px 8px #0002;">Bulk Upload Images</a>
        </div>
        '''
        html += '''<style>
        #existing-image-gallery div[data-image-id]:hover { box-shadow:0 8px 32px #0004; border-color:#1976d2; }
        #existing-image-gallery img:hover { transform:scale(1.04); }
        #existing-image-gallery .delete-image-btn:hover { background:#b71c1c; }
        </style>'''
        return format_html(html) if images or obj else "No images yet."
    display_images.short_description = 'Image Gallery'

    def sizes_link(self, obj):
        if obj and obj.pk:
            url = f"/admin/products/productsizevariant/?color_variant__id__exact={obj.pk}"
            return format_html(
                '<div style="margin:10px 0;"><a class="button" href="{}" target="_blank" style="font-size:16px;padding:8px 20px;background:#1976d2;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;box-shadow:0 2px 8px #0001;">Manage Sizes</a></div>'
                '<div style="font-size:13px;color:#555;margin-bottom:10px;">Click to manage sizes and stock for this color variant.</div>',
                url
            )
        return format_html('<span style="color:#b00;">Save and continue editing to manage sizes.</span>')
    sizes_link.short_description = 'Manage Sizes'

    class Media:
        js = ('js/admin-productcolorvariant-images.js',)

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('upload-images/<int:variant_id>/', self.admin_site.admin_view(self.upload_images_view), name='productcolorvariant_upload_images'),
        ]
        return custom_urls + urls

    @method_decorator(csrf_exempt)
    def upload_images_view(self, request, variant_id):
        if request.method == 'POST':
            try:
                variant = ProductColorVariant.objects.get(pk=variant_id)
                for file in request.FILES.getlist('images'):
                    ProductColorVariantImage.objects.create(color_variant=variant, image=file)
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

# Stock inline for size+color
class ProductStockInline(TabularInline):
    model = ProductStock
    extra = 0
    fields = ('size_variant', 'quantity', 'reserved_quantity', 'is_active', 'available_quantity', 'stock_status', 'stock_display')
    readonly_fields = ('size_variant', 'quantity', 'reserved_quantity', 'is_active', 'available_quantity', 'stock_status', 'stock_display')
    can_delete = False
    show_change_link = False
    ordering_field = None  # Unfold compatibility

    def has_add_permission(self, request, obj=None):
        return False
    def has_change_permission(self, request, obj=None):
        return False
    def has_delete_permission(self, request, obj=None):
        return False

    def available_quantity(self, obj):
        return obj.available_quantity if obj else 0
    available_quantity.short_description = 'Available'

    def stock_status(self, obj):
        return obj.stock_status if obj else 'unknown'
    stock_status.short_description = 'Status'

    def stock_display(self, obj):
        return obj.stock_display if obj else 'N/A'
    stock_display.short_description = 'Display'

class MultiFileInput(FileInput):
    allow_multiple_selected = True
    def __init__(self, attrs=None):
        attrs = attrs or {}
        attrs['multiple'] = True
        super().__init__(attrs)

class ProductColorVariantForm(forms.ModelForm):
    images = forms.FileField(
        widget=MultiFileInput,
        required=False,
        help_text="Upload one or more images for this color variant."
    )

    class Meta:
        model = ProductColorVariant
        fields = '__all__'

# Register Product with nested-admin (default Django admin)
from django.contrib import admin as django_admin
@django_admin.register(Product)
class ProductAdmin(nested_admin.NestedModelAdmin):
    list_display = ('name', 'slug', 'category', 'price', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductColorVariantInline]
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'category', 'price', 'sale_percent')
        }),
        ('Product Images', {
            'fields': ('indoor_image', 'outdoor_image'),
            'description': 'Upload indoor and outdoor images for the product.'
        }),
    )

@admin.register(ProductColorVariant)
class ProductColorVariantAdmin(django_admin.ModelAdmin):
    form = ProductColorVariantAdminForm
    list_display = ('product', 'color', 'is_active', 'created_at')
    search_fields = ('product__name', 'color')
    readonly_fields = ('display_images',)
    fieldsets = (
        (None, {
            'fields': ('product', 'color', 'color_hex', 'is_active', 'sizes', 'stock_M', 'stock_L', 'stock_XL', 'stock_2XL', 'images')
        }),
        ('Existing Images', {
            'fields': ('display_images',),
        }),
    )
    class Media:
        js = ('js/admin-productcolorvariant-images.js',)
    inlines = [] # Removed AttachmentInline
    def display_images(self, obj):
        images = obj.images.all()
        html = '<div id="existing-image-gallery" style="display:flex;flex-wrap:wrap;gap:10px;">'
        for img in images:
            html += f'''<div data-image-id="{img.id}" style="position:relative;display:inline-block;">
                <input type="checkbox" value="{img.id}" style="position:absolute;top:5px;left:5px;z-index:2;">
                <img src="{img.image.url}" style="max-height:100px;border-radius:5px;box-shadow:0 2px 8px #0002;">
                <button type="button" class="delete-image-btn" data-image-id="{img.id}" style="position:absolute;top:5px;right:5px;background:#222;color:#fff;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;z-index:2;">&times;</button>
            </div>'''
        html += '</div>'
        return format_html(html) if images else "No images yet."
    display_images.short_description = 'Image Gallery'
    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        for image_file in request.FILES.getlist('images'):
            ProductColorVariantImage.objects.create(color_variant=obj, image=image_file)

    actions = ['bulk_upload_images']

    def get_urls(self):
        urls = super().get_urls()
        from django.urls import path
        custom_urls = [
            path('action/bulk-upload-images/', self.admin_site.admin_view(self.bulk_upload_color_variant_images), name='productcolorvariant_bulk_upload_images'),
        ]
        return custom_urls + urls

    @staff_member_required
    def bulk_upload_color_variant_images(self, request):
        if request.method == 'POST':
            form = ProductColorVariantBulkImageUploadForm(request.POST, request.FILES)
            if form.is_valid():
                color_variant = form.cleaned_data['color_variant']
                images = request.FILES.getlist('images')
                for img in images:
                    ProductColorVariantImage.objects.create(color_variant=color_variant, image=img)
                return render(request, 'admin/bulk_upload_color_variant_images.html', {
                    'form': ProductColorVariantBulkImageUploadForm(),
                    'success': True,
                    'color_variant': color_variant,
                    'uploaded_count': len(images),
                })
        else:
            form = ProductColorVariantBulkImageUploadForm()
        return render(request, 'admin/bulk_upload_color_variant_images.html', {'form': form})

    def bulk_upload_images(self, request, queryset):
        if 'apply' in request.POST:
            form = BulkImageUploadForm(request.POST, request.FILES)
            if form.is_valid():
                images = request.FILES.getlist('images')
                for variant in queryset:
                    for img in images:
                        ProductColorVariantImage.objects.create(color_variant=variant, image=img)
                self.message_user(request, f"Uploaded {len(images)} images to {queryset.count()} color variant(s).", messages.SUCCESS)
                return redirect(request.get_full_path())
        else:
            form = BulkImageUploadForm()
        return render(request, 'admin/bulk_upload_images.html', context={
            'form': form,
            'variants': queryset,
            'action_checkbox_name': admin.helpers.ACTION_CHECKBOX_NAME,
        })
    bulk_upload_images.short_description = "Bulk upload images to selected color variants"
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<path:object_id>/delete/', self.admin_site.admin_view(self.delete_variant_view), name='productcolorvariant_delete'),
            path('<path:object_id>/edit/', self.admin_site.admin_view(self.edit_variant_view), name='productcolorvariant_edit'),
        ]
        return custom_urls + urls
    @method_decorator(csrf_exempt)
    def delete_variant_view(self, request, object_id):
        if request.method == 'POST':
            try:
                ProductColorVariant.objects.filter(id=object_id).delete()
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)
    @method_decorator(csrf_exempt)
    def edit_variant_view(self, request, object_id):
        if request.method == 'POST':
            try:
                import json
                data = json.loads(request.body)
                variant = ProductColorVariant.objects.get(id=object_id)
                variant.color = data.get('color', variant.color)
                variant.color_hex = data.get('color_hex', variant.color_hex)
                variant.is_active = data.get('is_active', variant.is_active)
                variant.save()
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

@admin.register(ProductColorVariantImage)
class ProductColorVariantImageAdmin(django_admin.ModelAdmin):
    list_display = ('id', 'color_variant', 'image', 'alt_text', 'created_at')
    search_fields = ('color_variant__product__name', 'alt_text')
    ordering = ('color_variant', 'created_at')
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<path:object_id>/delete/', self.admin_site.admin_view(self.delete_image_view), name='productcolorvariantimage_delete'),
            path('<path:object_id>/edit/', self.admin_site.admin_view(self.edit_image_view), name='productcolorvariantimage_edit'),
        ]
        return custom_urls + urls
    @method_decorator(csrf_exempt)
    def delete_image_view(self, request, object_id):
        if request.method == 'POST':
            try:
                ProductColorVariantImage.objects.filter(id=object_id).delete()
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)
    @method_decorator(csrf_exempt)
    def edit_image_view(self, request, object_id):
        if request.method == 'POST':
            try:
                import json
                data = json.loads(request.body)
                img = ProductColorVariantImage.objects.get(id=object_id)
                img.alt_text = data.get('alt_text', img.alt_text)
                img.save()
                return JsonResponse({'success': True})
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        return JsonResponse({'success': False, 'error': 'Invalid request'}, status=400)

@admin.register(ProductSizeVariant)
class ProductSizeVariantAdmin(django_admin.ModelAdmin):
    list_display = ('color_variant', 'size', 'stock', 'is_active')
    search_fields = ('color_variant__product__name', 'size')

    def changelist_view(self, request, extra_context=None):
        extra_context = extra_context or {}
        extra_context['help_text'] = (
            "To manage sizes for a product: Go to the Product admin, select a product, "
            "then add/edit color variants. For each color variant, you can add sizes and stock."
        )
        return super().changelist_view(request, extra_context=extra_context)

# Remove ProductStock from admin registration to avoid direct editing
try:
    admin.site.unregister(ProductStock)
except admin.sites.NotRegistered:
    pass

class CollectionGalleryImageInline(admin.TabularInline):
    model = CollectionGalleryImage
    extra = 1
    fields = ('image', 'order', 'created_at', 'thumbnail')
    readonly_fields = ('created_at', 'thumbnail')
    ordering = ('order', 'created_at')

    def thumbnail(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:60px;max-width:100px;object-fit:cover;" />', obj.image.url)
        return ""
    thumbnail.short_description = 'Preview'

@admin.register(CollectionImage)
class CollectionImageAdmin(admin.ModelAdmin):
    list_display = ('title', 'order', 'is_active', 'created_at', 'image_preview')
    list_filter = ('is_active',)
    search_fields = ('title',)
    ordering = ('order', 'created_at')
    inlines = [CollectionGalleryImageInline]
    fieldsets = (
        (None, {
            'fields': ('title', 'image', 'is_active', 'order')
        }),
    )
    readonly_fields = ('image_preview',)

    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:60px;max-width:100px;object-fit:cover;" />', obj.image.url)
        return ""
    image_preview.short_description = 'Main Image Preview'

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'product_count', 'is_active', 'order', 'created_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('order', 'name')
    readonly_fields = ('product_count', 'created_at', 'updated_at')
    fieldsets = (
        (None, {
            'fields': ('name', 'slug', 'description', 'image', 'is_active', 'order')
        }),
        ('Statistics', {
            'fields': ('product_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def product_count(self, obj):
        return obj.product_count
    product_count.short_description = 'Products'

@admin.register(SiteAnnouncement)
class SiteAnnouncementAdmin(admin.ModelAdmin):
    list_display = ('message', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('message',)
    ordering = ('-created_at',)
