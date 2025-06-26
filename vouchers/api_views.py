from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from .models import Voucher
from .utils import apply_voucher as apply_voucher_util
from decimal import Decimal

@api_view(['POST'])
@permission_classes([AllowAny])
def apply_voucher(request):
    code = request.data.get('code')
    total = request.data.get('total')
    if not code:
        return Response({'error': 'No voucher code provided.'}, status=status.HTTP_400_BAD_REQUEST)
    if total is None:
        return Response({'error': 'No order total provided.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        total_decimal = Decimal(str(total))
        # You can pass user if you want to restrict per-user, for now pass None
        new_total, voucher = apply_voucher_util(None, code, total_decimal)
        if voucher is None:
            return Response({'success': False, 'error': 'Invalid or inactive voucher code.'}, status=status.HTTP_404_NOT_FOUND)
        discount_percent = float(voucher.discount_percent)
        discount_amount = float(total_decimal - new_total)
        return Response({'success': True, 'discount_percent': discount_percent, 'discount_amount': discount_amount})
    except Voucher.DoesNotExist:
        return Response({'success': False, 'error': 'Invalid or inactive voucher code.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=status.HTTP_400_BAD_REQUEST) 