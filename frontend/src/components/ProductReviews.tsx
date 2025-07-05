import React, { useState, useEffect } from 'react';
import { Star, MessageCircle, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';
import { ProductReview } from '../types/review';
import { FaStarHalfAlt } from 'react-icons/fa';

interface ProductReviewsProps {
  productId: number;
  productSlug: string;
  productName: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, productSlug, productName }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getProductReviews(productId);
        setReviews(data);
      } catch {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const displayedReviews = showAll ? reviews : reviews.slice(0, 3);

  // Helper to render stars with half-star support
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push(<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />);
      } else if (rating >= i - 0.5) {
        stars.push(<FaStarHalfAlt key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-zinc-300 dark:text-zinc-600" />);
      }
    }
    return stars;
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3"></div>
                  </div>
                </div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <MessageCircle className="h-6 w-6 text-[#059669]" />
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Customer Reviews
          </h3>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            ({reviews.length})
          </span>
        </div>
      </div>

      {/* Rating Summary */}
      {reviews.length > 0 && (
        <div className="mb-6 p-4 bg-zinc-50 dark:bg-zinc-700/50 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                {getAverageRating()}
              </div>
              <div className="flex items-center justify-center space-x-1 mt-1">
                {renderStars(Number(getAverageRating()))}
              </div>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {reviews.length} reviews
              </div>
            </div>
            <div className="flex-1">
              <div className="space-y-1">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = getRatingDistribution()[rating as keyof ReturnType<typeof getRatingDistribution>];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={rating} className="flex items-center space-x-2">
                      <span className="text-sm text-zinc-600 dark:text-zinc-400 w-4">
                        {rating}
                      </span>
                      <div className="flex-1 bg-zinc-200 dark:bg-zinc-600 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400 w-8">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
            No reviews yet
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Be the first to review {productName}
          </p>
          {user && (
            <Link
              to={`/products/${productSlug}/review`}
              className="inline-flex items-center px-4 py-2 bg-[#059669] text-white font-medium rounded-lg hover:bg-[#059669]/90 transition-colors"
            >
              Be the First to Review
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <div
              key={review.id}
              className="border border-zinc-200 dark:border-zinc-700 rounded-lg p-4"
            >
              <div className="flex items-start space-x-3">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {review.user_avatar ? (
                    <img
                      src={review.user_avatar}
                      alt={review.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-zinc-500" />
                    </div>
                  )}
                </div>

                {/* Review Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-zinc-900 dark:text-white">
                      {review.username}
                    </span>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <p className="text-zinc-700 dark:text-zinc-300 mb-2">
                    {review.comment}
                  </p>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(review.created_at)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Show More/Less Button */}
          {reviews.length > 3 && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[#059669] hover:text-[#059669]/80 font-medium transition-colors"
              >
                {showAll ? 'Show Less' : `Show All ${reviews.length} Reviews`}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-center py-4">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ProductReviews; 