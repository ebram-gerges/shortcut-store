# Reviews Feature Documentation

This document provides an overview of the new reviews feature in the Shortcut Store application.

## 1. Summary

The reviews feature allows customers to submit reviews for products and the website. This includes a star rating, a comment, and user information.

## 2. Frontend Changes

### `frontend/src/components/Reviews.tsx`

This component is responsible for displaying customer reviews on the product page. It fetches and renders reviews, including star ratings, user information, and comments.

### `frontend/src/components/CustomerReviews.tsx`

This component displays all customer reviews in a single page.

### `frontend/src/components/WebsiteReviews.tsx`

This component displays all website feedback.

### `frontend/src/services/reviewService.ts`

This service handles all API requests related to reviews.

## 3. Backend Changes

### `reviews/api_urls.py`

This file contains the API endpoints for the reviews feature.

### `reviews/api_views.py`

This file contains the API views for the reviews feature.

### `reviews/models.py`

This file contains the database models for the reviews feature.

### `reviews/admin.py`

This file contains the admin panel configuration for the reviews feature.

## 4. How to Use

- To view product reviews, navigate to a product page and click on the "Reviews" tab.
- To submit a product review, click on the "Add a review" button on the product page.
- To view all customer reviews, navigate to the "/reviews" page.
- To view all website feedback, navigate to the "/feedback" page.
- To manage reviews, navigate to the admin panel and click on the "Reviews" section.
