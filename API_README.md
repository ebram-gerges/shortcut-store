# Shortcut Store API Documentation

## Base URL
`http://localhost:8000/`

## Authentication

### JWT Authentication
- **POST** `/api/token/` - Obtain JWT token
  - Request body: `{ "username": "user", "password": "pass" }`
  - Returns: `{ "refresh": "...", "access": "..." }`

- **POST** `/api/token/refresh/` - Refresh JWT token
  - Request body: `{ "refresh": "your-refresh-token" }`

## User Management

### Registration & Authentication
- **POST** `/accounts/api/register/` - Register new user
- **POST** `/accounts/login/` - User login
- **POST** `/accounts/logout/` - User logout
- **GET** `/accounts/verify-email/<int:user_id>/` - Verify email
- **POST** `/accounts/resend-verification/` - Resend verification code
- **POST** `/accounts/password-reset/` - Request password reset
- **POST** `/accounts/password-reset-confirm/<int:user_id>/` - Confirm password reset

### User Profile
- **GET|PUT|PATCH** `/accounts/profile/` - View/Update user profile
- **GET|PUT|PATCH** `/accounts/api/user/` - User API endpoint

## Products

### Product Listing
- **GET** `/products/` - List all products
- **GET** `/products/<int:product_id>/` - Get product details
- **GET** `/products/<int:product_id>/quick-view/` - Quick view of product

### Product Variants
- **GET** `/products/<int:product_id>/color/<str:color>/` - Get images for color variant
- **GET** `/products/<int:product_id>/stock/<str:color>/<str:size>/` - Check stock status

### Product API (DRF ViewSet)
- **GET** `/api/products/` - List all products (API)
- **GET** `/api/products/<pk>/` - Get product details (API)
- **POST** `/api/products/` - Create product (Admin only)
- **PUT|PATCH** `/api/products/<pk>/` - Update product (Admin only)
- **DELETE** `/api/products/<pk>/` - Delete product (Admin only)

## Shopping Cart

### Cart Management
- **GET** `/cart/` - View cart page
- **POST** `/cart/add/` - Add item to cart
- **POST** `/cart/remove/` - Remove item from cart
- **POST** `/cart/update-quantity/` - Update item quantity
- **GET** `/cart/get-cart/` - Get cart contents (JSON)

### Cart API (DRF ViewSet)
- **GET** `/api/cart/` - Get cart items (API)
- **POST** `/api/cart/` - Add to cart (API)
- **PUT|PATCH** `/api/cart/<pk>/` - Update cart item (API)
- **DELETE** `/api/cart/<pk>/` - Remove from cart (API)

## Wishlist
- **GET** `/wishlist/` - View wishlist
- **POST** `/wishlist/add/` - Add to wishlist
- **POST** `/wishlist/remove/` - Remove from wishlist

## Orders
- **GET** `/orders/` - List user's orders
- **POST** `/orders/create/` - Create new order
- **GET** `/orders/<order_id>/` - Order details
- **GET** `/checkout/` - Checkout page (redirects to `/orders/checkout/`)

## Vouchers
- **GET** `/vouchers/` - List available vouchers
- **POST** `/vouchers/apply/` - Apply voucher to cart
- **POST** `/vouchers/remove/` - Remove voucher from cart

## Reviews
- **GET** `/reviews/product/<int:product_id>/` - Get product reviews
- **POST** `/reviews/submit/` - Submit a review
- **PUT|PATCH** `/reviews/<int:review_id>/` - Update review
- **DELETE** `/reviews/<int:review_id>/` - Delete review

## Media Files
- **GET** `/media/<path:path>` - Access uploaded media files

## Admin
- **GET** `/admin/` - Django admin interface

## Notes
- All API endpoints (except authentication) require JWT authentication
- Include JWT token in the `Authorization` header: `Bearer <your_token>`
- CSRF protection is enabled for session-based authentication
- File uploads are handled through multipart/form-data

## Error Responses
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
