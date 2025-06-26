from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
import os

LOGO_PATH = os.path.join(os.path.dirname(__file__), '../media/site-logo.png')


def generate_order_pdf(order, recipient_type='user'):
    """
    Generate a PDF summary for the given order.
    recipient_type: 'user' or 'admin'
    Returns (pdf_bytes, filename)
    """
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y = height - 40

    # Draw logo at the top
    try:
        logo_path = LOGO_PATH
        if os.path.exists(logo_path):
            p.drawImage(ImageReader(logo_path), 40, y-40, width=120, height=40, mask='auto')
            y -= 50
    except Exception:
        pass

    # Top text
    if recipient_type == 'user':
        p.setFont("Helvetica-Bold", 14)
        p.setFillColorRGB(0.8, 0, 0)  # Red
        p.drawString(200, y, "receiver")
        p.setFillColorRGB(0, 0, 0)
        y -= 20
    elif recipient_type == 'admin':
        y -= 10

    p.setFont("Helvetica-Bold", 16)
    p.drawString(40, y, f"Order Summary - Order #{order.id} ({order.serial})")
    y -= 30
    p.setFont("Helvetica", 12)
    user_full_name = f"{order.shipping_first_name} {order.shipping_last_name}".strip() or order.user.get_full_name() or order.user.username
    p.drawString(40, y, f"User: {user_full_name} ({order.user.email})")
    y -= 20
    p.drawString(40, y, f"Order ID: {order.id}")
    y -= 20
    p.drawString(40, y, f"Serial: {order.serial}")
    y -= 20
    p.drawString(40, y, f"Status: {order.status}")
    y -= 20
    p.drawString(40, y, f"Total Price: {order.total_price}")
    y -= 30
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Shipping Info:")
    y -= 20
    p.setFont("Helvetica", 12)
    p.drawString(40, y, f"Name: {order.shipping_first_name} {order.shipping_last_name}")
    y -= 20
    p.drawString(40, y, f"Email: {order.shipping_email}")
    y -= 20
    p.drawString(40, y, f"Address: {order.shipping_address}")
    y -= 20
    p.drawString(40, y, f"City: {order.shipping_city}")
    y -= 20
    p.drawString(40, y, f"Governorate: {order.shipping_governorate}")
    y -= 20
    p.drawString(40, y, f"Phone: {order.shipping_phone}")
    y -= 20
    phone2 = getattr(order, 'shipping_phone2', None)
    if phone2:
        p.drawString(40, y, f"Phone 2: {phone2}")
        y -= 20
    y -= 30
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Order Items:")
    y -= 20
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Product | Qty | Color | Size | Orig.Price | Sale% | Final Price")
    y -= 16
    p.setFont("Helvetica", 12)
    subtotal = 0
    total_sale_discount = 0
    for item in order.items.all():
        original_price = float(item.product.price) * item.quantity
        subtotal += original_price
        sale_percent = getattr(item.product, 'sale_percent', 0) or 0
        sale_discount = (float(item.product.price) * sale_percent / 100) * item.quantity
        total_sale_discount += sale_discount
        final_price = float(item.price)
        p.drawString(50, y, f"{item.product.name} | {item.quantity} | {item.color or '-'} | {item.size or '-'} | {float(item.product.price):.2f} | {sale_percent}% | {final_price:.2f}")
        y -= 18
        if y < 100:
            p.showPage()
            y = height - 40
    # Voucher discount
    voucher_discount = 0
    if order.voucher:
        voucher_discount = subtotal - total_sale_discount - float(order.total_price)
    # Price breakdown section
    y -= 10
    p.setFont("Helvetica-Bold", 14)
    p.drawString(40, y, "Price Breakdown:")
    y -= 20
    p.setFont("Helvetica", 12)
    p.drawString(50, y, f"Subtotal (before discounts): {subtotal:.2f}")
    y -= 18
    p.drawString(50, y, f"Total Sale Discount: -{total_sale_discount:.2f}")
    y -= 18
    if order.voucher:
        p.drawString(50, y, f"Total Voucher Discount: -{voucher_discount:.2f}")
        y -= 18
    p.drawString(50, y, f"Final Total: {order.total_price:.2f}")
    y -= 30

    # Footer
    if recipient_type == 'user':
        # Red line at the bottom
        p.setStrokeColorRGB(0.8, 0, 0)
        p.setLineWidth(3)
        p.line(40, 50, width-40, 50)
        p.setFont("Helvetica-Bold", 11)
        p.setFillColorRGB(0.8, 0, 0)
        p.drawString(50, 35, "do not delete this receipt, it will be used in refunds")
        p.setFillColorRGB(0, 0, 0)
    elif recipient_type == 'admin':
        p.setFont("Helvetica-Bold", 11)
        p.setFillColorRGB(0.8, 0, 0)
        p.drawString(50, 35, "this receipt is for the delivery service only do not use for refund or further process")
        p.setFillColorRGB(0, 0, 0)

    p.save()
    buffer.seek(0)
    pdf_data = buffer.read()
    buffer.close()
    # Filename: First_Last_order_SERIAL.pdf
    safe_first = (order.shipping_first_name or order.user.first_name or "").strip().replace(" ", "_")
    safe_last = (order.shipping_last_name or order.user.last_name or "").strip().replace(" ", "_")
    filename = f"{safe_first}_{safe_last}_order_{order.serial}.pdf".replace("__", "_")
    return pdf_data, filename 