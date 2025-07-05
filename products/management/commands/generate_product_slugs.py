from django.core.management.base import BaseCommand
from products.models import Product

class Command(BaseCommand):
    help = 'Generate slugs for all products that do not have one.'

    def handle(self, *args, **options):
        updated = 0
        for product in Product.objects.all():
            if not product.slug:
                product.save()  # triggers slug generation in model
                updated += 1
        self.stdout.write(self.style.SUCCESS(f'Generated slugs for {updated} products.')) 