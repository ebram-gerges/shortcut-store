from django.shortcuts import render
from products.models import Product
from django.db.models import Max

def landing_page(request):
    """Main landing page for Shortcut Store"""
    newest_product = Product.objects.order_by('-created_at').first()
    sale_products = Product.objects.filter(sale_percent__gt=0)
    all_products = Product.objects.all()[:12]  # Get first 12 products for the grid

    # Get the highest sale percentage
    highest_sale = Product.objects.filter(sale_percent__gt=0).aggregate(
        max_sale=Max('sale_percent')
    )['max_sale']

    # Default to 15 if no sales found
    max_sale_percent = highest_sale if highest_sale else 15

    return render(request, 'shortcut_store/index.html', {
        'newest_product': newest_product,
        'sale_products': sale_products,
        'all_products': all_products,
        'max_sale_percent': max_sale_percent,
    })

def shortcut_store(request):
    """Shortcut Store main view"""
    return render(request, 'shortcut_store/index.html')
