from django.shortcuts import render, redirect
from .models import Order, OrderItem
from cart.models import CartItem
from vouchers.models import Voucher
from django.contrib.auth.decorators import login_required

@login_required
def place_order(request):
    cart_items = CartItem.objects.filter(user=request.user)
    if not cart_items:
        return redirect('cart:cart_view')

    total = sum(item.total_price() for item in cart_items)
    voucher = request.session.get('voucher_id')
    applied_voucher = None

    if voucher:
        applied_voucher = Voucher.objects.get(id=voucher)
        total -= applied_voucher.discount

    order = Order.objects.create(user=request.user, total_price=total, voucher=applied_voucher)

    for item in cart_items:
        OrderItem.objects.create(
            order=order,
            product=item.product,
            quantity=item.quantity,
            price=item.total_price()
        )
        item.delete()  # clear the cart

    return redirect('orders:order_summary', order_id=order.id)

@login_required
def order_summary(request, order_id):
    order = Order.objects.get(id=order_id, user=request.user)
    return render(request, 'orders/order_summary.html', {'order': order})
