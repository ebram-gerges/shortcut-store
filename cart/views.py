from django.shortcuts import render, redirect, get_object_or_404
from .models import CartItem
from products.models import Product
from vouchers.utils import apply_voucher

def view_cart(request):
    items = CartItem.objects.filter(user=request.user)
    total_price = sum([item.get_total_price() for item in items])
    voucher_code = request.GET.get('voucher')
    discounted_total, discount = apply_voucher(voucher_code, total_price) if voucher_code else (total_price, 0)
    return render(request, 'cart/cart.html', {
        'items': items,
        'total_price': total_price,
        'discounted_total': discounted_total,
        'discount': discount,
        'voucher_code': voucher_code,
    })

def add_to_cart(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    cart_item, created = CartItem.objects.get_or_create(user=request.user, product=product)
    cart_item.quantity += 1
    cart_item.save()
    return redirect('view_cart')

def remove_from_cart(request, item_id):
    item = get_object_or_404(CartItem, id=item_id, user=request.user)
    item.delete()
    return redirect('view_cart')