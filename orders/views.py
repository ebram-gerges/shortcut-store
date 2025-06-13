from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from decimal import Decimal
import json

from .models import Order, OrderItem
from cart.models import CartItem
from vouchers.models import Voucher
from products.models import Product

@login_required
def checkout(request):
    """Checkout page with order confirmation functionality"""
    # Get cart items for the user
    cart_items = CartItem.objects.filter(user=request.user).select_related(
        'product', 'color_variant'
    ).prefetch_related('color_variant__images')

    if not cart_items.exists():
        return redirect('/cart/')

    # Calculate totals
    subtotal = sum(item.total_price for item in cart_items)
    shipping_cost = Decimal('0.00')  # Free shipping for now

    # Apply shipping cost logic
    if subtotal < 1000:
        shipping_cost = Decimal('50.00')

    total = subtotal + shipping_cost

    # Egyptian governorates for dropdown
    governorates = [
        'Cairo', 'Alexandria', 'Giza', 'Qalyubia', 'Port Said', 'Suez',
        'Luxor', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Dakahlia',
        'Damietta', 'Fayyum', 'Gharbia', 'Ismailia', 'Kafr el-Sheikh',
        'Matrouh', 'Minya', 'Monufia', 'New Valley', 'North Sinai',
        'Qena', 'Red Sea', 'Sharqia', 'Sohag', 'South Sinai'
    ]

    if request.method == 'POST':
        return process_checkout(request, cart_items, subtotal, shipping_cost, total)

    context = {
        'cart_items': cart_items,
        'subtotal': subtotal,
        'shipping_cost': shipping_cost,
        'total': total,
        'governorates': governorates,
        'user': request.user,
    }

    return render(request, 'orders/checkout.html', context)

def process_checkout(request, cart_items, subtotal, shipping_cost, total):
    """Process the checkout form submission"""
    try:
        with transaction.atomic():
            # Create order
            order = Order.objects.create(
                user=request.user,
                subtotal=subtotal,
                shipping_cost=shipping_cost,
                total_price=total,

                # Shipping information
                shipping_first_name=request.POST.get('first_name'),
                shipping_last_name=request.POST.get('last_name'),
                shipping_email=request.POST.get('email'),
                shipping_phone=request.POST.get('phone'),
                shipping_address=request.POST.get('address'),
                shipping_city=request.POST.get('city'),
                shipping_governorate=request.POST.get('governorate'),
                shipping_postal_code=request.POST.get('postal_code', ''),

                # Payment information
                payment_method=request.POST.get('payment_method', 'cod'),
                status='pending'
            )

            # Create order items
            for cart_item in cart_items:
                OrderItem.objects.create(
                    order=order,
                    product=cart_item.product,
                    color_variant=cart_item.color_variant,
                    size=cart_item.size,
                    quantity=cart_item.quantity,
                    unit_price=cart_item.product.discounted_price,
                    total_price=cart_item.total_price
                )

            # Clear cart
            cart_items.delete()

            return redirect('orders:order_summary', order_id=order.id)

    except Exception as e:
        # Handle errors
        context = {
            'error': 'An error occurred while processing your order. Please try again.',
            'cart_items': cart_items,
            'subtotal': subtotal,
            'shipping_cost': shipping_cost,
            'total': total,
        }
        return render(request, 'orders/checkout.html', context)

@login_required
def place_order(request):
    cart_items = CartItem.objects.filter(user=request.user)
    if not cart_items:
        return redirect('/cart/')

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
