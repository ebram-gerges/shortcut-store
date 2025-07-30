from rest_framework import viewsets, filters, status
from rest_framework.decorators import action, api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Product, ProductColorVariant, ProductStock, CollectionImage, Category, SiteAnnouncement, Question
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from .serializers import (
    ProductListSerializer, 
    ProductDetailSerializer, 
    ProductCreateUpdateSerializer,
    ProductColorVariantSerializer,
    ProductStockSerializer,
    CollectionImageSerializer,
    CategorySerializer,  # <-- add this import
    QuestionSerializer,  # <-- add this import
)
import logging
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import AllowAny
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.csrf import csrf_protect

logger = logging.getLogger(__name__)

class ProductViewSet(viewsets.ModelViewSet):
    lookup_field = 'slug'
    """
    ViewSet for Product CRUD operations
    """
    queryset = Product.objects.all().select_related('category').prefetch_related(
        'color_variants__images', 'stock_items'
    ).only('id', 'name', 'description', 'price', 'sale_percent', 'category', 'created_at', 'indoor_image', 'outdoor_image')
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
        
        # Filter by category slug
        category_slug = self.request.query_params.get('category_slug')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
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
        
        # Filter by availability - use exists() for better performance
        in_stock = self.request.query_params.get('in_stock')
        if in_stock and in_stock.lower() == 'true':
            queryset = queryset.filter(stock_items__quantity__gt=0).distinct()
        
        return queryset
    
    @action(detail=True, methods=['get'])
    def variants(self, request, pk=None):
        """Get all color variants for a product"""
        product = self.get_object()
        variants = product.color_variants.select_related('product').prefetch_related('images').all()
        serializer = ProductColorVariantSerializer(variants, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stock(self, request, pk=None):
        """Get stock information for a product"""
        product = self.get_object()
        stock_items = product.stock_items.select_related('product', 'size_variant__color_variant').all()
        serializer = ProductStockSerializer(stock_items, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'], url_path='stock/(?P<color>[^/.]+)/(?P<size>[^/.]+)')
    def check_stock(self, request, pk=None, color=None, size=None):
        """Check stock for specific color and size combination"""
        product = self.get_object()
        
        try:
            color_variant = product.color_variants.select_related('product').get(color=color)
            stock_item = ProductStock.objects.select_related('product', 'size_variant__color_variant').get(
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
        categories = Category.objects.filter(is_active=True)
        serializer = CategorySerializer(categories, many=True, context={'request': request})
        return Response(serializer.data)
    
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
def get_site_announcement(request):
    announcement = SiteAnnouncement.objects.filter(is_active=True).order_by('-updated_at').first()
    return Response({
        'message': announcement.message if announcement else '',
        'id': announcement.id if announcement else None,
        'updated_at': announcement.updated_at if announcement else None,
    })

@csrf_exempt
def test_simple(request):
    """
    Simple test endpoint to check if CSRF is the issue
    """
    return JsonResponse({'message': 'Test endpoint works!', 'status': 'success'})

@csrf_exempt
def submit_question(request):
    print("DEBUG: submit_question view called")
    """
    Simple Django view to submit questions - completely bypasses CSRF
    """
    # Manually disable CSRF for this view
    request._dont_enforce_csrf_checks = True
    
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        import json
        # Parse JSON from request body
        data = json.loads(request.body.decode('utf-8'))
        
        # Validate required fields
        required_fields = ['username', 'email', 'product', 'question']
        for field in required_fields:
            if field not in data:
                return JsonResponse({'error': f'Missing required field: {field}'}, status=400)
        
        # Create question directly without serializer for now
        try:
            product = Product.objects.get(id=data['product'])
        except Product.DoesNotExist:
            return JsonResponse({'error': 'Product not found'}, status=404)
        
        # Create the question
        question = Question.objects.create(
            username=data['username'],
            email=data['email'],
            product=product,
            question=data['question']
        )
        
        # Send email to all admin users
        User = get_user_model()
        admin_emails = list(User.objects.filter(is_staff=True).values_list('email', flat=True))
        subject = f"New Product Question: {product.name}"
        message = (
            f"A new question was submitted on {question.date.strftime('%Y-%m-%d %H:%M')}\n\n"
            f"Product: {product.name}\n"
            f"User: {question.username} ({question.email})\n"
            f"Question: {question.question}\n"
        )
        # HTML email with logo, glassy effect, and green colors (max compatibility)
        html_message = f"""
        <html>
        <body style='margin:0; padding:0; background:#f6fff9;'>
          <table width='100%' cellpadding='0' cellspacing='0' border='0' style='background:#f6fff9; padding: 32px 0;'>
            <tr>
              <td align='center'>
                <table width='500' cellpadding='0' cellspacing='0' border='0' style='background:#fff; border-radius:18px; box-shadow:0 4px 24px rgba(9,185,120,0.10); border:2px solid #059669; padding:0 0 24px 0;'>
                  <tr>
                    <td align='center' style='padding:32px 0 12px 0;'>
                      <img src='https://shortcut-eg.store/static/images/logo.png' alt='Shortcut Store Logo' style='height:56px; display:block; margin-bottom:8px;'>
                      <h2 style='color:#059669; font-family:sans-serif; margin:0; font-size:2rem; font-weight:800; letter-spacing:1px;'>Shortcut Store</h2>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:0 32px;'>
                      <h3 style='color:#059669; font-family:sans-serif; margin:24px 0 12px 0; font-size:1.3rem;'>New Product Question</h3>
                      <div style='font-family:sans-serif; font-size:1.08rem; color:#222; background:#e6f9f2; padding:16px 20px; border-radius:12px; margin-bottom:20px; border:1px solid #059669;'>
                        <b>Product:</b> {product.name}<br>
                        <b>User:</b> {question.username} ({question.email})<br>
                        <b>Question:</b><br>
                        <span style='display:inline-block; margin-top:8px; padding:10px 14px; background:#f6fff9; border-radius:8px; color:#059669; font-weight:600; font-size:1.05rem; border:1px solid #059669;'>{question.question}</span>
                      </div>
                      <div style='text-align:right; font-size:0.95rem; color:#059669;'>
                        <em>Submitted on {question.date.strftime('%Y-%m-%d %H:%M')}</em>
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """
        send_mail(subject, message, None, admin_emails, html_message=html_message, fail_silently=True)
        
        return JsonResponse({
            'success': True, 
            'message': 'Your question has been submitted.',
            'question_id': question.id
        })
        
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)
    except Exception as e:
        logger.error(f"Error submitting question: {str(e)}")
        return JsonResponse({'error': 'Internal server error'}, status=500)
