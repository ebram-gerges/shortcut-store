from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Product, ProductColorVariant, ProductStock, CollectionImage, CategoryImage
from .serializers import (
    ProductListSerializer, 
    ProductDetailSerializer, 
    ProductCreateUpdateSerializer,
    ProductColorVariantSerializer,
    ProductStockSerializer,
    CollectionImageSerializer,
    CategoryImageSerializer
)
import logging

logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Product CRUD operations
    """
    queryset = Product.objects.all().prefetch_related(
        'color_variants__images', 'stock_items'
    )
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'sale_percent']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ProductListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProductCreateUpdateSerializer
        return ProductDetailSerializer
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsAuthenticatedOrReadOnly]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        
        if min_price:
            try:
                queryset = queryset.filter(price__gte=float(min_price))
            except ValueError:
                pass
                
        if max_price:
            try:
                queryset = queryset.filter(price__lte=float(max_price))
            except ValueError:
                pass
        
        # Filter by availability
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock__gt=0)
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """Get all color variants for a product"""
        product = self.get_object()
        variants = product.color_variants.all()
        serializer = ProductColorVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        """Get stock information for a product"""
        product = self.get_object()
        stock_items = product.stock_items.all()
        serializer = ProductStockSerializer(stock_items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='stock/(?P<color>[^/.]+)/(?P<size>[^/.]+)')
    def check_stock(self, request, pk=None, color=None, size=None):
        """Check stock for specific color and size combination"""
        product = self.get_object()
        
        try:
            color_variant = product.color_variants.get(color=color)
            stock_item = ProductStock.objects.get(
                product=product,
                color_variant=color_variant,
                size=size
            )
            
            return Response({
                'available_quantity': stock_item.available_quantity,
                'stock_status': stock_item.stock_status,
                'can_add_to_cart': stock_item.available_quantity > 0,
                'max_quantity': min(10, stock_item.available_quantity)
            })
        except (ProductColorVariant.DoesNotExist, ProductStock.DoesNotExist):
            return Response({
                'available_quantity': 0,
                'stock_status': 'out_of_stock',
                'can_add_to_cart': False,
                'max_quantity': 0
            })
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search products by name or description"""
        query = request.query_params.get('q', '')
        if not query:
            return Response({'results': []})
        
        products = self.get_queryset().filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        )
        
        serializer = self.get_serializer(products, many=True)
        return Response({'results': serializer.data})
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available categories"""
        categories = Product.CATEGORY_CHOICES
        return Response([{'value': value, 'label': label} for value, label in categories])
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products (products with sale_percent > 0)"""
        featured_products = self.get_queryset().filter(sale_percent__gt=0)[:8]
        serializer = ProductListSerializer(featured_products, many=True)
        return Response(serializer.data)

    def list(self, request, *args, **kwargs):
        try:
            queryset = self.filter_queryset(self.get_queryset())
            logger.debug(f"ProductViewSet.list queryset: {queryset}")
            serializer = self.get_serializer(queryset, many=True)
            logger.debug(f"ProductViewSet.list serializer data: {serializer.data}")
            return Response(serializer.data)
        except Exception as e:
            logger.exception(f"Error in ProductViewSet.list: {e}")
            return Response({'error': str(e)}, status=500)

@api_view(['GET'])
def collection_images_list(request):
    images = CollectionImage.objects.filter(is_active=True).order_by('order', 'created_at')
    serializer = CollectionImageSerializer(images, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def category_images_list(request):
    images = CategoryImage.objects.filter(is_active=True).order_by('order', 'created_at')
    serializer = CategoryImageSerializer(images, many=True)
    return Response(serializer.data)
