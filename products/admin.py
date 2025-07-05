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
from .forms import ProductColorVariantAdminForm, ProductColorVariantBulkImageUploadForm
from django.shortcuts import render, redirect
from django.urls import path
from django.contrib import messages
from django_attach.forms import AttachmentInline
from django.contrib.admin.views.decorators import staff_member_required

# ProductColorVariantImageInline removed - using custom gallery instead

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
    # Remove form reference to avoid field errors
    extra = 0
    readonly_fields = ('display_images',)
    ordering_field = None  # Unfold compatibility
    # Remove the image inline - we'll use custom gallery instead
    inlines = []

    def get_fieldsets(self, request, obj=None):
        return [
            ('Color Variant Details', {
                'fields': [
                    'color', 'color_hex', 'is_active', 'sizes',
                    'stock_M', 'stock_L', 'stock_XL', 'stock_2XL',
                ],
                'description': 'Set the color, hex code, activation, sizes, and stock for this variant.'
            }),
            ('Image Gallery', {
                'fields': ['display_images'],
                'description': 'Manage images for this color variant.'
            }),
        ]

    def display_images(self, obj):
        """Display custom image gallery with upload functionality"""
        if not obj or not obj.pk:
            return format_html('''
                <div style="padding:20px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px;border:1px solid #dee2e6;">
                    <p style="margin:0;font-size:14px;"><em>Save this color variant first to add images.</em></p>
                </div>
            ''')
        
        images = obj.images.all()
        
        # Generate a unique ID for this variant's gallery
        gallery_id = f"gallery_{obj.id}"
        
        html = f'''
        <div id="{gallery_id}" style="margin-bottom:20px;">
            <div style="margin-bottom:12px;font-weight:bold;font-size:17px;letter-spacing:0.5px;color:#333;">
                Image Gallery ({images.count()} image{'s' if images.count() != 1 else ''})
            </div>
        '''
        
        # Display images if any exist
        if images.exists():
            html += f'''
            <div id="existing-image-gallery-{obj.id}" style="display:flex;flex-wrap:wrap;gap:15px;margin-bottom:20px;">
            '''
            for img in images:
                html += f'''
                <div data-image-id="{img.id}" style="position:relative;display:flex;align-items:center;justify-content:center;transition:box-shadow 0.2s;box-shadow:0 4px 16px rgba(0,0,0,0.1);border-radius:12px;border:2px solid #e0e0e0;overflow:hidden;background:#fafbfc;padding:10px;max-width:200px;max-height:200px;">
                    <img src="{img.image.url}" 
                         style="display:block;max-width:180px;max-height:180px;width:auto;height:auto;border-radius:8px;transition:transform 0.2s;object-fit:contain;background:#f5f5f5;" 
                         alt="{img.alt_text or 'Product image'}"
                         title="{img.alt_text or 'Product image'}">
                    <button type="button" 
                            class="delete-image-btn" 
                            data-image-id="{img.id}" 
                            data-variant-id="{obj.id}"
                            onclick="deleteImage(this, {img.id}, {obj.id})"
                            style="position:absolute;top:8px;right:8px;background:#d32f2f;color:#fff;border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;z-index:2;font-size:16px;box-shadow:0 2px 8px rgba(0,0,0,0.3);opacity:0.9;display:flex;align-items:center;justify-content:center;"
                            title="Delete image">
                        ×
                    </button>
                </div>
                '''
            html += '</div>'
        else:
            html += '''
            <div style="padding:15px;text-align:center;color:#666;background:#f8f9fa;border-radius:8px;border:1px solid #dee2e6;margin-bottom:20px;">
                <p style="margin:0;font-size:14px;"><em>No images uploaded yet.</em></p>
            </div>
            '''
        
        # Add upload buttons
        html += f'''
        <div style="text-align:center;margin-bottom:20px;">
            <div style="display:flex;gap:15px;justify-content:center;flex-wrap:wrap;">
                <a href="/admin/products/productcolorvariant/action/bulk-upload-images/" target="_blank" 
                   style="display:inline-block;font-size:14px;padding:10px 20px;background:#1976d2;color:#fff;border-radius:6px;text-decoration:none;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.2);transition:background 0.3s;">
                   📁 Bulk Upload Images
                </a>
                <button type="button" onclick="toggleQuickUpload({obj.id})" 
                        style="display:inline-block;font-size:14px;padding:10px 20px;background:#28a745;color:#fff;border:none;border-radius:6px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.2);cursor:pointer;transition:background 0.3s;">
                    ⚡ Quick Add Images
                </button>
            </div>
        </div>
        
        <!-- Quick upload form (hidden by default) -->
        <div id="quick-upload-form-{obj.id}" style="display:none;margin-top:20px;padding:20px;background:#f8f9fa;border-radius:8px;border:1px solid #dee2e6;">
            <h4 style="margin:0 0 15px 0;color:#333;">Quick Upload Images</h4>
            <form method="post" enctype="multipart/form-data" action="/admin/products/productcolorvariant/upload-images/{obj.id}/" style="margin:0;" onsubmit="return handleQuickUpload(this, {obj.id});">
                <input type="hidden" name="csrfmiddlewaretoken" value="" class="csrf-token-input">
                <div style="margin-bottom:15px;">
                    <input type="file" name="images" multiple accept="image/*" 
                           style="width:100%;padding:10px;border:1px solid #ddd;border-radius:4px;"
                           onchange="previewFiles(this, {obj.id})">
                    <small style="color:#666;display:block;margin-top:5px;">Select multiple images (JPG, PNG, GIF, WebP - Max 5MB each, up to 10 images)</small>
                </div>
                <div id="preview-container-{obj.id}" style="margin-bottom:15px;display:flex;flex-wrap:wrap;gap:10px;"></div>
                <div style="display:flex;gap:10px;">
                    <button type="submit" style="background:#007cba;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">
                        Upload Now
                    </button>
                    <button type="button" onclick="toggleQuickUpload({obj.id})" 
                            style="background:#6c757d;color:#fff;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
        </div>
        '''
        
        # Add CSS and JavaScript
        html += '''
        <style>
        #existing-image-gallery div[data-image-id]:hover { 
            box-shadow:0 8px 32px rgba(0,0,0,0.2); 
            border-color:#1976d2; 
        }
        #existing-image-gallery img:hover { 
            transform:scale(1.04); 
        }
        .delete-image-btn:hover { 
            background:#b71c1c !important; 
            opacity:1 !important;
        }
        </style>
        
        <script>
        // Set CSRF tokens when the page loads
        document.addEventListener('DOMContentLoaded', function() {
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            if (csrfToken) {
                const tokenInputs = document.querySelectorAll('.csrf-token-input');
                tokenInputs.forEach(input => {
                    input.value = csrfToken.value;
                });
            }
        });
        
        function toggleQuickUpload(variantId) {
            const form = document.getElementById('quick-upload-form-' + variantId);
            if (form) {
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
                
                // Set CSRF token when showing the form
                if (form.style.display !== 'none') {
                    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
                    const formCsrfInput = form.querySelector('.csrf-token-input');
                    if (csrfToken && formCsrfInput) {
                        formCsrfInput.value = csrfToken.value;
                    }
                }
            }
        }
        
        function previewFiles(input, variantId) {
            const container = document.getElementById('preview-container-' + variantId);
            container.innerHTML = '';
            
            if (input.files && input.files.length > 0) {
                for (let i = 0; i < Math.min(input.files.length, 10); i++) {
                    const file = input.files[i];
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        const preview = document.createElement('div');
                        preview.style.cssText = 'position:relative;width:60px;height:60px;border:1px solid #ddd;border-radius:4px;overflow:hidden;';
                        preview.innerHTML = `<img src="${e.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
                        container.appendChild(preview);
                    };
                    
                    reader.readAsDataURL(file);
                }
            }
        }
        
        function deleteImage(button, imageId, variantId) {
            if (!confirm('Are you sure you want to delete this image?')) return;
            
            button.disabled = true;
            button.innerHTML = '⏳';
            
            // Get CSRF token
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page.');
                button.disabled = false;
                button.innerHTML = '×';
                return;
            }
            
            fetch('/admin/products/productcolorvariantimage/' + imageId + '/delete/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken.value,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Remove the image element
                    const imageElement = button.closest('[data-image-id]');
                    if (imageElement) {
                        imageElement.remove();
                    }
                    // Update the gallery count
                    const gallery = document.getElementById('gallery_' + variantId);
                    if (gallery) {
                        const countElement = gallery.querySelector('div[style*="font-weight:bold"]');
                        if (countElement) {
                            const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]) - 1;
                            countElement.textContent = `Image Gallery (${currentCount} image${currentCount !== 1 ? 's' : ''})`;
                        }
                    }
                } else {
                    alert('Failed to delete image: ' + (data.error || 'Unknown error'));
                    button.disabled = false;
                    button.innerHTML = '×';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to delete image');
                button.disabled = false;
                button.innerHTML = '×';
            });
        }
        
        function handleQuickUpload(form, variantId) {
            const formData = new FormData(form);
            const files = form.querySelector('input[type="file"]').files;
            
            if (files.length === 0) {
                alert('Please select at least one image');
                return false;
            }
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Uploading...';
            
            fetch(form.action, {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Successfully uploaded ' + data.uploaded_count + ' image(s)');
                    location.reload(); // Refresh to show new images
                } else {
                    alert('Upload failed: ' + (data.error || 'Unknown error'));
                }
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Upload failed');
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            });
            
            return false; // Prevent default form submission
        }
        </script>
        '''
        
        return format_html(html)
    
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

# Removed unused ProductColorVariantForm class - using ProductColorVariantAdminForm instead

# NEW: Inline for managing color variant images in Product admin
class ProductColorVariantImageInline(admin.TabularInline):
    model = ProductColorVariantImage
    extra = 0
    fields = ('color_variant', 'image', 'alt_text', 'image_preview')
    readonly_fields = ('image_preview',)
    
    def image_preview(self, obj):
        if obj.image:
            return format_html('<img src="{}" style="max-height:60px;max-width:100px;object-fit:cover;" />', obj.image.url)
        return ""
    image_preview.short_description = 'Preview'

# Register Product with nested-admin (default Django admin)
from django.contrib import admin as django_admin
@django_admin.register(Product)
class ProductAdmin(nested_admin.NestedModelAdmin):
    list_display = ('name', 'slug', 'category', 'price', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductColorVariantInline, ProductColorVariantImageInline]
    
    # NEW: Add custom fieldsets with new tab for color variant images
    def get_fieldsets(self, request, obj=None):
        fieldsets = [
            ('General', {
                'fields': ('name', 'slug', 'description', 'category', 'price', 'sale_percent')
            }),
            ('Product Images', {
                'fields': ('indoor_image', 'outdoor_image'),
                'description': 'Upload indoor and outdoor images for the product.'
            }),
        ]
        
        # Add color variant images tab if object exists
        if obj:
            fieldsets.append(
                ('Product Images for Colors', {
                    'fields': ('color_variant_images_management',),
                    'description': 'Manage images for each color variant of this product.',
                    'classes': ('collapse',)
                })
            )
        
        return fieldsets
    
    def get_readonly_fields(self, request, obj=None):
        readonly_fields = []
        if obj:  # Only show for existing products
            readonly_fields.append('color_variant_images_management')
        return readonly_fields
    
    def color_variant_images_management(self, obj):
        """Custom field for managing color variant images with bulk upload"""
        if not obj:
            return "Save the product first to manage color variant images."
        
        # Get all color variants for this product
        color_variants = obj.color_variants.all()
        
        if not color_variants.exists():
            return format_html(
                '<div style="padding:20px;background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;">'
                '<h3 style="margin-top:0;color:#666;">No Color Variants</h3>'
                '<p>Add color variants first in the "Product Color Variants" section above.</p>'
                '</div>'
            )
        
        html = f'''
        <div style="margin:20px 0;">
            <!-- Bulk Upload Section -->
            <div style="background:#e3f2fd;border:1px solid #1976d2;border-radius:8px;padding:20px;margin-bottom:30px;">
                <h3 style="margin-top:0;color:#1976d2;"><i class="fas fa-upload"></i> Bulk Upload Images</h3>
                <p style="margin:10px 0;color:#333;">Upload multiple images to any color variant quickly and securely.</p>
                
                                 <form id="bulk-upload-form" method="post" enctype="multipart/form-data" style="margin:15px 0;">
                     <input type="hidden" name="csrfmiddlewaretoken" value="">
                     <input type="hidden" name="product_id" value="{obj.id}">
                    
                    <div style="margin:15px 0;">
                        <label for="bulk_color_variant" style="font-weight:bold;display:block;margin-bottom:5px;">Select Color Variant:</label>
                        <select name="bulk_color_variant" id="bulk_color_variant" style="width:100%;max-width:300px;padding:8px;border:1px solid #ddd;border-radius:4px;">
                            <option value="">Choose a color variant...</option>
        '''
        
        for variant in color_variants:
            html += f'<option value="{variant.id}">{variant.color}</option>'
        
        html += f'''
                        </select>
                    </div>
                    
                    <div style="margin:15px 0;">
                        <label for="bulk_images" style="font-weight:bold;display:block;margin-bottom:5px;">Select Images:</label>
                        <input type="file" name="bulk_images" id="bulk_images" multiple accept="image/*" 
                               style="width:100%;padding:8px;border:1px solid #ddd;border-radius:4px;">
                        <small style="color:#666;">Max 10 images, 5MB each. Supports JPG, PNG, GIF, WebP.</small>
                    </div>
                    
                    <button type="button" onclick="handleBulkUpload()" 
                            style="background:#1976d2;color:white;padding:12px 24px;border:none;border-radius:6px;font-weight:bold;cursor:pointer;">
                        <i class="fas fa-cloud-upload-alt"></i> Upload Images
                    </button>
                </form>
                
                <div id="bulk-upload-status" style="margin-top:15px;"></div>
            </div>
            
            <!-- Color Variant Galleries -->
            <div style="background:#f8f9fa;border:1px solid #dee2e6;border-radius:8px;padding:20px;">
                <h3 style="margin-top:0;color:#333;"><i class="fas fa-images"></i> Color Variant Image Galleries</h3>
        '''
        
        for variant in color_variants:
            images = variant.images.all()
            image_count = images.count()
            
            html += f'''
                <div style="margin:20px 0;padding:15px;border:1px solid #e0e0e0;border-radius:6px;background:white;">
                    <h4 style="margin-top:0;color:{variant.color_hex if variant.color_hex else '#333'};">
                        <span style="display:inline-block;width:20px;height:20px;background-color:{variant.color_hex if variant.color_hex else '#ccc'};border-radius:3px;margin-right:8px;border:1px solid #ddd;"></span>
                        {variant.color} ({image_count} image{'s' if image_count != 1 else ''})
                    </h4>
                    
                    <!-- Quick Upload for this variant -->
                                         <form class="quick-upload-form" data-variant-id="{variant.id}" style="margin:10px 0;padding:10px;background:#f0f8ff;border-radius:4px;">
                         <input type="hidden" name="csrfmiddlewaretoken" value="">
                        <input type="file" name="quick_images" multiple accept="image/*" 
                               style="width:calc(100% - 120px);padding:5px;border:1px solid #ddd;border-radius:3px;margin-right:10px;">
                        <button type="button" onclick="handleQuickUpload(this, {variant.id})" 
                                style="background:#4caf50;color:white;padding:6px 12px;border:none;border-radius:3px;cursor:pointer;">
                            Quick Add
                        </button>
                    </form>
                    
                    <!-- Image Gallery -->
                    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:10px;margin-top:15px;">
            '''
            
            for image in images:
                html += f'''
                    <div style="position:relative;border:1px solid #ddd;border-radius:4px;overflow:hidden;background:#f9f9f9;">
                        <img src="{image.image.url}" alt="{image.alt_text}" 
                             style="width:100%;height:100px;object-fit:cover;">
                        <div style="padding:8px;font-size:12px;">
                            <div style="margin-bottom:5px;color:#666;">ID: {image.id}</div>
                            <input type="text" value="{image.alt_text}" 
                                   onchange="updateAltText({image.id}, this.value)"
                                   style="width:100%;padding:3px;border:1px solid #ddd;border-radius:2px;font-size:11px;">
                        </div>
                        <button onclick="deleteImage({image.id}, {variant.id})" 
                                style="position:absolute;top:5px;right:5px;background:rgba(220,53,69,0.9);color:white;border:none;border-radius:50%;width:24px;height:24px;cursor:pointer;font-size:16px;line-height:1;">
                            ×
                        </button>
                    </div>
                '''
            
            if not images.exists():
                html += '<div style="padding:20px;text-align:center;color:#666;border:2px dashed #ddd;border-radius:4px;">No images yet. Use quick upload above to add some!</div>'
            
            html += '</div></div>'
        
                 html += '''
             </div>
         </div>
         
         <script>
         // Initialize CSRF tokens when the page loads
         document.addEventListener('DOMContentLoaded', function() {
             const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
             if (csrfToken) {
                 // Set CSRF token for all forms in this section
                 const tokenInputs = document.querySelectorAll('#bulk-upload-form [name="csrfmiddlewaretoken"], .quick-upload-form [name="csrfmiddlewaretoken"]');
                 tokenInputs.forEach(input => {
                     input.value = csrfToken.value;
                 });
             }
         });
         
         function handleBulkUpload() {
            const form = document.getElementById('bulk-upload-form');
            const colorVariant = document.getElementById('bulk_color_variant').value;
            const files = document.getElementById('bulk_images').files;
            const statusDiv = document.getElementById('bulk-upload-status');
            
            if (!colorVariant) {
                statusDiv.innerHTML = '<div style="background:#ff6b6b;color:white;padding:10px;border-radius:4px;">Please select a color variant.</div>';
                return;
            }
            
            if (files.length === 0) {
                statusDiv.innerHTML = '<div style="background:#ff6b6b;color:white;padding:10px;border-radius:4px;">Please select at least one image.</div>';
                return;
            }
            
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', form.querySelector('[name="csrfmiddlewaretoken"]').value);
            formData.append('color_variant', colorVariant);
            
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }
            
            statusDiv.innerHTML = '<div style="background:#4caf50;color:white;padding:10px;border-radius:4px;">Uploading...</div>';
            
            fetch('/admin/products/productcolorvariant/action/bulk-upload-images/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    statusDiv.innerHTML = '<div style="background:#4caf50;color:white;padding:10px;border-radius:4px;">Successfully uploaded ' + data.uploaded_count + ' image(s)!</div>';
                    setTimeout(() => {
                        location.reload();
                    }, 1500);
                } else {
                    statusDiv.innerHTML = '<div style="background:#ff6b6b;color:white;padding:10px;border-radius:4px;">Error: ' + (data.error || 'Upload failed') + '</div>';
                }
            })
            .catch(error => {
                statusDiv.innerHTML = '<div style="background:#ff6b6b;color:white;padding:10px;border-radius:4px;">Network error occurred.</div>';
            });
        }
        
        function handleQuickUpload(button, variantId) {
            const form = button.closest('.quick-upload-form');
            const files = form.querySelector('[name="quick_images"]').files;
            
            if (files.length === 0) {
                alert('Please select at least one image');
                return;
            }
            
            const formData = new FormData();
            formData.append('csrfmiddlewaretoken', form.querySelector('[name="csrfmiddlewaretoken"]').value);
            
            for (let i = 0; i < files.length; i++) {
                formData.append('images', files[i]);
            }
            
            button.disabled = true;
            button.textContent = 'Uploading...';
            
            fetch('/admin/products/productcolorvariant/upload-images/' + variantId + '/', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Successfully uploaded ' + data.uploaded_count + ' image(s)!');
                    location.reload();
                } else {
                    alert('Error: ' + (data.error || 'Upload failed'));
                }
                button.disabled = false;
                button.textContent = 'Quick Add';
            })
            .catch(error => {
                alert('Network error occurred');
                button.disabled = false;
                button.textContent = 'Quick Add';
            });
        }
        
        function deleteImage(imageId, variantId) {
            if (!confirm('Are you sure you want to delete this image?')) {
                return;
            }
            
            fetch('/admin/products/productcolorvariantimage/' + imageId + '/delete/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name="csrfmiddlewaretoken"]').value,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    location.reload();
                } else {
                    alert('Failed to delete image: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                alert('Failed to delete image');
            });
        }
        
        function updateAltText(imageId, newAltText) {
            fetch('/admin/products/productcolorvariantimage/' + imageId + '/edit/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': document.querySelector('[name="csrfmiddlewaretoken"]').value,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    alt_text: newAltText
                })
            })
            .then(response => response.json())
            .then(data => {
                if (!data.success) {
                    alert('Failed to update alt text: ' + (data.error || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Failed to update alt text:', error);
            });
        }
        </script>
        '''
        
        return format_html(html)
    
    color_variant_images_management.short_description = 'Manage Color Variant Images'

# Temporarily remove ProductColorVariant admin registration to fix field error
# We'll add a simpler version

class ProductColorVariantAdmin(django_admin.ModelAdmin):
    list_display = ('product', 'color', 'is_active', 'created_at')
    search_fields = ('product__name', 'color')
    list_filter = ('color', 'is_active', 'created_at')
    
    # Exclude the reverse foreign key relationship field that Django admin can't handle
    exclude = ('images',)
    
    def changelist_view(self, request, extra_context=None):
        """Add bulk upload button to the changelist view"""
        extra_context = extra_context or {}
        extra_context.update({
            'bulk_upload_url': '/admin/products/productcolorvariant/action/bulk-upload-images/',
            'show_bulk_upload_button': True,
        })
        return super().changelist_view(request, extra_context)
    
    def get_urls(self):
        urls = super().get_urls()
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

# Register the admin manually to avoid conflicts
admin.site.register(ProductColorVariant, ProductColorVariantAdmin)

@admin.register(ProductColorVariantImage)
class ProductColorVariantImageAdmin(django_admin.ModelAdmin):
    list_display = ('id', 'color_variant', 'image', 'alt_text', 'created_at')
    search_fields = ('color_variant__product__name', 'alt_text')
    ordering = ('color_variant', 'created_at')
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:object_id>/delete/', self.admin_site.admin_view(self.delete_image_view), name='productcolorvariantimage_delete'),
            path('<int:object_id>/edit/', self.admin_site.admin_view(self.edit_image_view), name='productcolorvariantimage_edit'),
        ]
        return custom_urls + urls
    
    def delete_image_view(self, request, object_id):
        """Secure image deletion view"""
        
        # Check if user has permission to delete ProductColorVariantImage
        if not request.user.has_perm('products.delete_productcolorvariantimage'):
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to delete images.")
        
        if request.method == 'POST':
            try:
                image = ProductColorVariantImage.objects.get(id=object_id)
                
                # Log the deletion action
                from django.contrib.admin.models import LogEntry, DELETION
                from django.contrib.contenttypes.models import ContentType
                
                LogEntry.objects.create(
                    user=request.user,
                    content_type=ContentType.objects.get_for_model(ProductColorVariantImage),
                    object_id=object_id,
                    object_repr=str(image),
                    action_flag=DELETION,
                    change_message="Deleted image from gallery"
                )
                
                # Delete the image
                image.delete()
                
                return JsonResponse({'success': True, 'message': 'Image deleted successfully'})
                
            except ProductColorVariantImage.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Image not found'}, status=404)
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)
    
    def edit_image_view(self, request, object_id):
        """Secure image editing view"""
        
        # Check if user has permission to change ProductColorVariantImage
        if not request.user.has_perm('products.change_productcolorvariantimage'):
            from django.core.exceptions import PermissionDenied
            raise PermissionDenied("You don't have permission to edit images.")
        
        if request.method == 'POST':
            try:
                import json
                data = json.loads(request.body)
                image = ProductColorVariantImage.objects.get(id=object_id)
                
                # Update alt text
                old_alt_text = image.alt_text
                image.alt_text = data.get('alt_text', image.alt_text)
                image.save()
                
                # Log the edit action
                from django.contrib.admin.models import LogEntry, CHANGE
                from django.contrib.contenttypes.models import ContentType
                
                LogEntry.objects.create(
                    user=request.user,
                    content_type=ContentType.objects.get_for_model(ProductColorVariantImage),
                    object_id=object_id,
                    object_repr=str(image),
                    action_flag=CHANGE,
                    change_message=f"Changed alt text from '{old_alt_text}' to '{image.alt_text}'"
                )
                
                return JsonResponse({'success': True, 'message': 'Image updated successfully'})
                
            except ProductColorVariantImage.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Image not found'}, status=404)
            except Exception as e:
                return JsonResponse({'success': False, 'error': str(e)}, status=500)
        
        return JsonResponse({'success': False, 'error': 'Invalid request method'}, status=405)

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
