# Project Memory: Shortcut Store

## Project Metadata
- **Stack:** Django backend, Nginx, static/media file serving, React frontend
- **Deployment:** Linux server, Nginx as reverse proxy/static file server
- **Database:** PostgreSQL (production), SQLite (dev)
- **Current Directory Structure:** Standard Django + custom folders
- **Django Settings:** Consistently using `shortcut.settings_production` for all operations

## Current Task
- ~~Implement a dropdown menu for the Basic Top category filter on the frontend, where clicking the category reveals three subcategory checkboxes (Sleeves, Sleeveless, Cut).~~ ✅ COMPLETED
- UI improvements for product cards on the products page ✅ COMPLETED
- **ANALYSIS: Deep understanding of ProductCard image usage and backend image structure** ✅ COMPLETED
- **IMPROVEMENT: Implement responsive images with WebP/AVIF support in ProductCard** ✅ COMPLETED
- **IMPROVEMENT: Change color variant ordering from alphabetical to chronological** ✅ COMPLETED
- **IMPROVEMENT: Update navbar with specific category quick links** ✅ COMPLETED

## Notes
- Previous issues included: Django admin login, static files, Nginx config, frontend hero section not showing images due to 404s from API.
- Debugging so far: Nginx config checked, permissions checked, Nginx reinstalled, debug logging enabled, minimal config tested, files confirmed on disk.
- CORS issues: CORS headers were missing due to Gunicorn not using the production settings. Fixed by starting Gunicorn with DJANGO_SETTINGS_MODULE=shortcut.settings_production. CORS is now restricted to only https://shortcut-eg.store and https://www.shortcut-eg.store using CORS_ALLOWED_ORIGIN_REGEXES.
- All CORS and production settings are now active and working as intended.
- **Nginx now serves the React build from frontend/dist as the main site root, with Django static and media files handled via /static/ and /media/ using alias, and API/admin proxied to Gunicorn. The static file 404 issue is fully resolved.**
- **Frontend Category interface updated to include subcategories field for proper TypeScript support.**
- **Product card UI improvements completed: SALE badge moved to top-right with tilt, one-size badge simplified to show only "one size" text.**

## Backend Image Structure Analysis
- **Product Model:** Has `indoor_image` and `outdoor_image` fields (legacy, not used in current ProductCard)
- **ProductColorVariant Model:** Links to Product, contains color information
- **ProductColorVariantImage Model:** Contains actual product images linked to color variants
- **Image Processing:** Backend generates multiple formats (WebP, AVIF) and sizes (400w, 800w, 1200w, 2000w) via `process_image_variants()` function
- **API Response:** ProductListSerializer includes `color_variants` with nested `images` array containing `image` and `image_variants` fields

## ProductCard Image Usage Analysis
- **Main Image:** Uses `firstVariant.images[0].image` (first image of first color variant)
- **Hover Image:** Uses `firstVariant.images[1].image` (second image of first color variant, falls back to main image)
- **Image URL Building:** `getFullUrl()` function constructs full URLs by prepending API base URL and ensuring `/media/` prefix
- **Responsive Images:** `ResponsivePicture` component defined but NOT USED in current ProductCard implementation
- **Image Variants:** Backend provides `image_variants` JSON with WebP/AVIF formats and multiple sizes, but frontend doesn't use them

## Color Variant Ordering Analysis (UPDATED)
- **Backend Ordering:** `ProductColorVariant` model uses `ordering = ['created_at']` - orders by creation time (CHANGED from alphabetical)
- **Image Ordering:** `ProductColorVariantImage` model uses `ordering = ['created_at']` - orders by creation date
- **First Variant Selection:** Frontend takes `product.color_variants[0]` which is now the first created color variant (not alphabetically first)
- **API Query:** Uses `prefetch_related('color_variants__images')` which respects the model ordering
- **Migration Applied:** `0013_change_color_variant_ordering.py` - Changed from `ordering = ['color']` to `ordering = ['created_at']`

## Responsive Image Improvements (COMPLETED)
- **ResponsivePicture Component:** Now actively used for both main and hover images
- **WebP/AVIF Support:** Takes advantage of backend-generated image variants
- **Optimized Sizes:** Uses `sizes="(max-width: 768px) 100vw, 340px"` for proper responsive loading
- **Fallback Handling:** Graceful fallback to original image if variants not available
- **No Image State:** Added placeholder for products without images
- **Performance:** Uses largest WebP image as default, with AVIF as preferred format

## Navbar Category Filtering (COMPLETED)
- **Removed:** "Top Selling" and "Summer Collection" from navbar
- **Added:** Specific category quick links with proper slugs:
  - Basic Top → `/products?category=basic-top`
  - Oversize T-Shirt → `/products?category=oversize-t-shirts`
  - Suits → `/products?category=suits`
  - Sweatpants → `/products?category=sweatpants`
- **Implementation:** Static navigation links instead of dynamic category loading
- **Filtering:** Uses existing ProductsPage filtering system with URL parameters
- **Mobile Support:** Works on both desktop and mobile navigation

## Completed Tasks
- Unified size logic and stock syncing between backend and frontend.
- Subcategory filtering for "Basic Top" implemented and debugged (backend and API).
- Persistent CORS issues traced to Gunicorn settings, now resolved.
- **Static file 404s (admin, Jazzmin, images, favicon) fully resolved by removing default Nginx config, reissuing SSL, and using a best-practice Nginx config to serve React, static, media, and Django backend.**
- **Frontend Category interface updated with SubCategory type and subcategories field.**
- **Product card UI improvements:**
  - SALE badge moved from top-left to top-right corner
  - SALE badge rotation changed from -18deg to +18deg for natural tilt
  - One-size badge simplified to show only "one size" (removed product name and color)
- **Frontend build completed successfully with all changes.**
- **Deep analysis of ProductCard image usage and backend image structure completed.**
- **Responsive image implementation with WebP/AVIF support completed.**
- **Color variant ordering changed from alphabetical to chronological (creation time).**
- **Navbar updated with specific category quick links for better user navigation.**

## Pending Todos
- [ ] ~~Implement a dropdown menu for Basic Top category filter with three subcategory checkboxes (Sleeves, Sleeveless, Cut) in the frontend filter sidebar.~~ ✅ COMPLETED
- [ ] ~~Update Category interface to include subcategories field~~ ✅ COMPLETED
- [ ] ~~Move SALE badge to top-right of product cards~~ ✅ COMPLETED
- [ ] ~~Simplify one-size badge to show only "one size"~~ ✅ COMPLETED
- [ ] ~~Analyze ProductCard image usage and backend image structure~~ ✅ COMPLETED
- [ ] ~~Implement responsive images with WebP/AVIF support~~ ✅ COMPLETED
- [ ] ~~Change color variant ordering from alphabetical to chronological~~ ✅ COMPLETED
- [ ] ~~Update navbar with specific category quick links~~ ✅ COMPLETED 