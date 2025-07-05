from django.core.management.base import BaseCommand
from products.models import Product, Category
from django.db import transaction

class Command(BaseCommand):
    help = 'Create Category objects for each unique string in Product.category (CharField).'

    def handle(self, *args, **options):
        with transaction.atomic():
            unique_categories = Product.objects.values_list('category', flat=True).distinct()
            for cat_name in unique_categories:
                if not cat_name:
                    continue
                category_obj, created = Category.objects.get_or_create(name=cat_name)
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Created category: {cat_name}'))
            self.stdout.write(self.style.SUCCESS('Category creation complete.')) 