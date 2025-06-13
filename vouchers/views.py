from django.shortcuts import render, redirect
from django.contrib.admin.views.decorators import staff_member_required
from .models import Voucher
from .forms import VoucherForm

@staff_member_required
def create_voucher(request):
    if request.method == 'POST':
        form = VoucherForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('create_voucher')
    else:
        form = VoucherForm()
    return render(request, 'vouchers/create_voucher.html', {'form': form})
