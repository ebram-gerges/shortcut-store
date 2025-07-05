from django import forms
from .models import ProductColorVariant, ProductSizeVariant, ProductColorVariantImage

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
        fields = '__all__'

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
        help_text="Select the color variant to upload images to."
    )
    images = forms.FileField(
        required=True,
        label="Images",
        help_text="Select one or more images to upload."
    ) 