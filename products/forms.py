from django import forms
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from .models import ProductColorVariant, ProductSizeVariant, ProductColorVariantImage
import os

try:
    from PIL import Image as PILImage
except ImportError:
    PILImage = None

SIZES = [
    ('M', 'M'),
    ('L', 'L'),
    ('XL', 'XL'),
    ('2XL', '2XL'),
]

class ProductColorVariantAdminForm(forms.ModelForm):
    sizes = forms.MultipleChoiceField(
        choices=SIZES,
        widget=forms.CheckboxSelectMultiple,
        required=False,
        label="Available Sizes"
    )
    stock_M = forms.IntegerField(required=False, min_value=0, label="Stock for M")
    stock_L = forms.IntegerField(required=False, min_value=0, label="Stock for L")
    stock_XL = forms.IntegerField(required=False, min_value=0, label="Stock for XL")
    stock_2XL = forms.IntegerField(required=False, min_value=0, label="Stock for 2XL")

    class Meta:
        model = ProductColorVariant
        fields = ['product', 'color', 'color_hex', 'is_active']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance.pk:
            existing_sizes = ProductSizeVariant.objects.filter(color_variant=self.instance)
            self.fields['sizes'].initial = [sv.size for sv in existing_sizes]
            for sv in existing_sizes:
                if sv.size == 'M':
                    self.fields['stock_M'].initial = sv.stock
                if sv.size == 'L':
                    self.fields['stock_L'].initial = sv.stock
                if sv.size == 'XL':
                    self.fields['stock_XL'].initial = sv.stock
                if sv.size == '2XL':
                    self.fields['stock_2XL'].initial = sv.stock

    def save(self, commit=True):
        instance = super().save(commit)
        sizes = self.cleaned_data.get('sizes', [])
        stock_map = {
            'M': self.cleaned_data.get('stock_M', 0) or 0,
            'L': self.cleaned_data.get('stock_L', 0) or 0,
            'XL': self.cleaned_data.get('stock_XL', 0) or 0,
            '2XL': self.cleaned_data.get('stock_2XL', 0) or 0,
        }
        # Remove unselected sizes
        ProductSizeVariant.objects.filter(color_variant=instance).exclude(size__in=sizes).delete()
        # Add/update selected sizes
        for size in sizes:
            sv, created = ProductSizeVariant.objects.get_or_create(color_variant=instance, size=size)
            sv.stock = stock_map[size]
            sv.is_active = True
            sv.save()
        return instance 

class ProductColorVariantBulkImageUploadForm(forms.Form):
    color_variant = forms.ModelChoiceField(
        queryset=ProductColorVariant.objects.all(),
        label="Color Variant",
        help_text="Select the color variant to upload images to.",
        widget=forms.Select(attrs={
            'class': 'form-control',
            'style': 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;'
        })
    )
    images = forms.FileField(
        required=True,
        label="Images",
        help_text="Select one or more images to upload (Max 10 images, 5MB each).",
        widget=forms.ClearableFileInput(attrs={
            'multiple': True,
            'accept': 'image/*',
            'class': 'form-control',
            'style': 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;'
        })
    )
    alt_text = forms.CharField(
        required=False,
        label="Alt Text (Optional)",
        help_text="Default alt text for all uploaded images (will be appended with image number).",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'style': 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;',
            'placeholder': 'e.g., Product name in Blue'
        })
    )

    def clean_images(self):
        """Validate uploaded images"""
        files = self.files.getlist('images')
        
        if not files:
            raise ValidationError(_("Please select at least one image."))
        
        if len(files) > 10:
            raise ValidationError(_("You can upload a maximum of 10 images at once."))
        
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        max_size = 5 * 1024 * 1024  # 5MB
        
        for file in files:
            # Check file extension
            ext = os.path.splitext(file.name)[1].lower()
            if ext not in valid_extensions:
                raise ValidationError(
                    _("Invalid file type: %(filename)s. Only JPG, PNG, GIF, and WebP are allowed.") % 
                    {'filename': file.name}
                )
            
            # Check file size
            if file.size > max_size:
                raise ValidationError(
                    _("File too large: %(filename)s. Maximum size is 5MB.") % 
                    {'filename': file.name}
                )
            
            # Check if it's actually an image (only if PIL is available)
            if PILImage:
                try:
                    img = PILImage.open(file)
                    img.verify()
                    file.seek(0)  # Reset file pointer after verification
                except Exception:
                    raise ValidationError(
                        _("Invalid image file: %(filename)s. Please upload a valid image.") % 
                        {'filename': file.name}
                    )
        
        return files

    def save(self, commit=True):
        """Save uploaded images to the selected color variant"""
        if not self.is_valid():
            return []
        
        color_variant = self.cleaned_data['color_variant']
        files = self.cleaned_data['images']
        alt_text = self.cleaned_data.get('alt_text', '')
        
        created_images = []
        
        for i, file in enumerate(files, 1):
            # Generate alt text for each image
            image_alt_text = f"{alt_text} - Image {i}" if alt_text else f"{color_variant} - Image {i}"
            
            # Create the image record
            image = ProductColorVariantImage.objects.create(
                color_variant=color_variant,
                image=file,
                alt_text=image_alt_text
            )
            created_images.append(image)
        
        return created_images 