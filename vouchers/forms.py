from django import forms
from .models import Voucher

class VoucherForm(forms.ModelForm):
    class Meta:
        model = Voucher
        fields = ['code', 'discount_percent', 'is_active']

class VoucherApplyForm(forms.Form):
    code = forms.CharField(label='Voucher Code', max_length=50)
