# products/admin.py
from django import forms
from django.contrib import admin
from django.utils.html import format_html
from django.contrib.admin import ModelAdmin, TabularInline, StackedInline
from .models import Product, ProductColorVariant, ProductColorVariantImage, ProductSizeVariant, ProductStock, CollectionImage, CollectionGalleryImage, Category, SiteAnnouncement
from django.urls import path
from django.http import JsonResponse
import logging
import os
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.contrib.admin import AdminSite
import nested_admin
from django.forms.widgets import FileInput
from .forms import ProductColorVariantAdminForm, ProductColorVariantBulkImageUploadForm
from django.shortcuts import render, redirect
from django.urls import path
from django.contrib import messages
from django_attach.forms import AttachmentInline
from django.contrib.admin.views.decorators import staff_member_required

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
                <img src="{img.image.url}" style="display:block;max-width:200px;max-height:200px;width:auto;height:auto;border-radius:8px;transition:transform 0.2s;object-fit:contain;background:#f5f5f5;" alt="{img.alt_text}">
                <button type="button" class="delete-image-btn" data-image-id="{img.id}" style="position:absolute;top:8px;right:8px;background:#d32f2f;color:#fff;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;z-index:2;font-size:20px;box-shadow:0 2px 8px #0003;opacity:0.92;">&times;</button>
            </div>
            '''
        html += '</div>'
        
        # Add quick upload and bulk upload buttons
        html += f'''
        <div style="margin-top:18px;text-align:center;display:flex;gap:15px;justify-content:center;flex-wrap:wrap;">
            <a href="/admin/products/productcolorvariant/action/bulk-upload-images/" target="_blank" 
               style="display:inline-block;font-size:16px;padding:12px 28px;background:#1976d2;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;box-shadow:0 2px 8px #0002;transition:background 0.3s;">
               <i class="fas fa-upload"></i> Bulk Upload Images
            </a>
            <button type="button" onclick="toggleQuickUpload('{obj.id if obj else 0}')" 
                    style="display:inline-block;font-size:16px;padding:12px 28px;background:#28a745;color:#fff;border:none;border-radius:8px;font-weight:bold;box-shadow:0 2px 8px #0002;cursor:pointer;transition:background 0.3s;">
                <i class="fas fa-plus"></i> Quick Add Images
            </button>
        </div>
        '''
        
        # Add quick upload form (hidden by default)
        if obj and obj.pk:
            html += f'''
            <div id="quick-upload-form-{obj.id}" style="display:none;margin-top:20px;padding:20px;background:#f8f9fa;border-radius:8px;border:1px solid #dee2e6;">
                <h4 style="margin:0 0 15px 0;color:#333;">Quick Upload Images</h4>
                <form method="post" enctype="multipart/form-data" action="/admin/products/productcolorvariant/upload-images/{obj.id}/" style="margin:0;">
                    <input type="hidden" name="csrfmiddlewaretoken" value="{{{{ csrf_token }}}}">
                    <div style="margin-bottom:15px;">
                        <input type="file" name="images" multiple accept="image/*" 
                               style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;">
                        <small style="color:#666;">Select multiple images (JPG, PNG, GIF, WebP - Max 5MB each)</small>
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button type="submit" style="background:#007cba;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">
                            Upload Now
                        </button>
                        <button type="button" onclick="toggleQuickUpload('{obj.id}')" 
                                style="background:#6c757d;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            '''
        
        html += '''<style>
        #existing-image-gallery div[data-image-id]:hover { box-shadow:0 8px 32px #0004; border-color:#1976d2; }
        #existing-image-gallery img:hover { transform:scale(1.04); }
        #existing-image-gallery .delete-image-btn:hover { background:#b71c1c; }
        </style>
        <script>
        function toggleQuickUpload(variantId) {
            const form = document.getElementById('quick-upload-form-' + variantId);
            if (form) {
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
            }
        }
        </script>'''
        
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

    def upload_images_view(self, request, variant_id):
        """Secure quick upload view for individual color variant images"""
        
        # Check if user has permission to add ProductColorVariantImage
        if not request.user.has_perm('products.add_productcolorvariantimage'):
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to upload images.")
        
        if request.method == 'POST':
            try:
                variant = ProductColorVariant.objects.get(pk=variant_id)
                files = request.FILES.getlist('images')
                
                if not files:
                    return JsonResponse({'success': False, 'error': 'No files selected'}, status=400)
                
                if len(files) > 10:
                    return JsonResponse({'success': False, 'error': 'Maximum 10 images allowed'}, status=400)
                
                # Validate each file
                valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
                max_size = 5 * 1024 * 1024  # 5MB
                
                for file in files:
                    # Check file extension
                    ext = os.path.splitext(file.name)[1].lower()
                    if ext not in valid_extensions:
                        return JsonResponse({
                            'success': False, 
                            'error': f'Invalid file type: {file.name}. Only JPG, PNG, GIF, and WebP are allowed.'
                        }, status=400)
                    
                    # Check file size
                    if file.size > max_size:
                        return JsonResponse({
                            'success': False, 
                            'error': f'File too large: {file.name}. Maximum size is 5MB.'
                        }, status=400)
                
                # Create image records
                created_images = []
                for i, file in enumerate(files, 1):
                    alt_text = f"{variant} - Image {i}"
                    image = ProductColorVariantImage.objects.create(
                        color_variant=variant, 
                        image=file,
                        alt_text=alt_text
                    )
                    created_images.append(image)
                
                # Log the upload action
                from django.contrib.admin.models import LogEntry, ADDITION
                from django.contrib.contenttypes.models import ContentType
                
                LogEntry.objects.create(
                    user=request.user,
                    content_type=ContentType.objects.get_for_model(ProductColorVariant),
                    object_id=variant.id,
                    object_repr=str(variant),
                    action_flag=ADDITION,
                    change_message=f"Quick uploaded {len(created_images)} images"
                )
                
                # Return success response
                return JsonResponse({
                    'success': True, 
                    'message': f'Successfully uploaded {len(created_images)} image(s)',
                    'uploaded_count': len(created_images)
                })
                
            except ProductColorVariant.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Color variant not found'}, status=404)
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

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
    inlines = [AttachmentInline]
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
        """Secure bulk upload view for color variant images"""
        
        # Check if user has permission to add ProductColorVariantImage
        if not request.user.has_perm('products.add_productcolorvariantimage'):
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to upload images.")
        
        success_data = {}
        errors = []
        
        if request.method == 'POST':
            form = ProductColorVariantBulkImageUploadForm(request.POST, request.FILES)
            if form.is_valid():
                try:
                    # Save the images using the form's save method
                    created_images = form.save()
                    
                    color_variant = form.cleaned_data['color_variant']
                    success_data = {
                        'color_variant': color_variant,
                        'uploaded_count': len(created_images),
                        'image_ids': [img.id for img in created_images],
                    }
                    
                    # Log the upload action
                    from django.contrib.admin.models import LogEntry, ADDITION
                    from django.contrib.contenttypes.models import ContentType
                    
                    LogEntry.objects.create(
                        user=request.user,
                        content_type=ContentType.objects.get_for_model(ProductColorVariant),
                        object_id=color_variant.id,
                        object_repr=str(color_variant),
                        action_flag=ADDITION,
                        change_message=f"Bulk uploaded {len(created_images)} images"
                    )
                    
                    messages.success(
                        request,
                        f"Successfully uploaded {len(created_images)} image(s) to {color_variant}."
                    )
                    
                    # Create a new form for the next upload
                    form = ProductColorVariantBulkImageUploadForm()
                    
                except Exception as e:
                    errors.append(f"Error uploading images: {str(e)}")
                    messages.error(request, f"Error uploading images: {str(e)}")
            else:
                # Collect form errors
                for field, field_errors in form.errors.items():
                    for error in field_errors:
                        errors.append(f"{field}: {error}")
                
                # Show error messages
                for error in errors:
                    messages.error(request, error)
        else:
            form = ProductColorVariantBulkImageUploadForm()
        
        context = {
            'form': form,
            'title': 'Bulk Upload Images to Product Color Variant',
            'has_permission': True,
            'opts': ProductColorVariant._meta,
            'errors': errors,
            **success_data
        }
        
        return render(request, 'admin/bulk_upload_color_variant_images.html', context)

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
