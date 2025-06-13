from django.core.management.base import BaseCommand
from products.models import Product, ProductColorVariant, ProductStock, SizeChoices, ColorChoices
import random

class Command(BaseCommand):
    help = 'Populate stock data for products'

    def handle(self, *args, **options):
        self.stdout.write('Populating stock data...')
        
        # Get all products
        products = Product.objects.all()
        
        if not products.exists():
            self.stdout.write(self.style.ERROR('No products found. Please create products first.'))
            return
        
        for product in products:
            self.stdout.write(f'Processing product: {product.name}')
            
            # Create color variants if they don't exist
            colors = ['Black', 'White', 'Red', 'Blue', 'Green']
            for color in colors:
                color_variant, created = ProductColorVariant.objects.get_or_create(
                    product=product,
                    color=color,
                    defaults={
                        'color_hex': self.get_color_hex(color),
                        'stock': random.randint(0, 50),
                        'is_active': True
                    }
                )
                
                if created:
                    self.stdout.write(f'  Created color variant: {color}')
                
                # Create stock for each size
                sizes = ['S', 'M', 'L', 'XL']
                for size in sizes:
                    stock_quantity = random.randint(0, 20)
                    
                    stock_item, created = ProductStock.objects.get_or_create(
                        product=product,
                        color_variant=color_variant,
                        size=size,
                        defaults={
                            'quantity': stock_quantity,
                            'reserved_quantity': 0,
                            'is_active': True
                        }
                    )
                    
                    if created:
                        self.stdout.write(f'    Created stock: {color} {size} - {stock_quantity} units')
        
        self.stdout.write(self.style.SUCCESS('Stock data populated successfully!'))
    
    def get_color_hex(self, color):
        color_map = {
            'Black': '#000000',
            'White': '#ffffff',
            'Red': '#dc3545',
            'Blue': '#007bff',
            'Green': '#28a745',
            'Yellow': '#ffc107',
            'Navy': '#001f3f',
            'Grey': '#6c757d',
            'Brown': '#8b4513',
            'Burgundy': '#800020',
            'Violet': '#8a2be2',
            'Olive': '#808000',
        }
        return color_map.get(color, '#000000')
