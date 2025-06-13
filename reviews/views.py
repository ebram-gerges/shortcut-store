from django.shortcuts import render, redirect, get_object_or_404
from .models import Review
from products.models import Product

def product_reviews(request, product_id):
    product = get_object_or_404(Product, id=product_id)
    reviews = Review.objects.filter(product=product)
    return render(request, 'reviews/product_reviews.html', {'product': product, 'reviews': reviews})

def add_review(request, product_id):
    if request.method == 'POST':
        rating = request.POST.get('rating')
        comment = request.POST.get('comment')
        product = get_object_or_404(Product, id=product_id)
        Review.objects.create(user=request.user, product=product, rating=rating, comment=comment)
        return redirect('product_reviews', product_id=product_id)
    return render(request, 'reviews/add_review.html')