import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';
import { getProductBySlug } from '../services/productService';
import { ProductReview } from '../types/review';
import { Product } from '../types/product';

const ProductReviewPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<ProductReview | null>(null);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${slug}/review` } });
      return;
    }
  }, [user, navigate, slug]);

  useEffect(() => {
    if (!slug || !user) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, reviews] = await Promise.all([
          getProductBySlug(slug),
          reviewService.getProductReviews(slug)
        ]);
        setProduct(productData);
        // Check if user has already reviewed this product
        const userReview = reviews.find((review: ProductReview) => review.user.id === user?.id);
        if (userReview) {
          setExistingReview(userReview);
          setRating(userReview.rating);
          setComment(userReview.comment);
        }
      } catch {
        setError('Failed to load product information');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug, user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please write a review with at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewData = {
        product: product.id,
        rating,
        comment: comment.trim()
      };

      if (existingReview) {
        await reviewService.updateProductReview(existingReview.id, reviewData);
      } else {
        await reviewService.createProductReview(reviewData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/products/${product.slug}`);
      }, 2000);
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 py-8 pt-[125px]">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/products/${product.slug}`)}
            className="inline-flex items-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {existingReview ? 'Edit Review' : 'Write a Review'}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Share your experience with {product.name}
          </p>
        </div>

        {/* Product Info */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 mb-8 shadow-sm border border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-700 rounded-lg flex items-center justify-center overflow-hidden">
              {product.image ? (
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-zinc-400 text-xs">IMG</span>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                {product.name}
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                {product.price} EGP
              </p>
            </div>
          </div>
        </div>

        {/* Review Form */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Review Submitted!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Thank you for your review. Redirecting to product page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Your Rating *
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-zinc-300 dark:text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  {rating === 0 && 'Click to rate'}
                  {rating === 1 && 'Poor'}
                  {rating === 2 && 'Fair'}
                  {rating === 3 && 'Good'}
                  {rating === 4 && 'Very Good'}
                  {rating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Your Review *
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
                  placeholder="Share your experience with this product. What did you like or dislike? How does it fit? Any recommendations for other customers?"
                  required
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  {comment.length}/1000 characters (minimum 10)
                </p>
              </div>

              {/* Under Construction Notice */}
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-800 rounded-full flex items-center justify-center">
                    <span className="text-yellow-600 dark:text-yellow-400 text-sm font-bold">!</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Photo Upload Feature
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Photo upload functionality is currently under construction and will be available soon.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting || rating === 0 || comment.trim().length < 10}
                  className="inline-flex items-center px-6 py-3 bg-[#059669] text-white font-semibold rounded-lg hover:bg-[#059669]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      {existingReview ? 'Update Review' : 'Submit Review'}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductReviewPage; 