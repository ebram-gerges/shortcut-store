import React, { useState, useEffect } from 'react';
import { Star, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import { WebsiteReview } from '../types/review';

const ReviewSummary: React.FC = () => {
  const [reviews, setReviews] = useState<WebsiteReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getWebsiteReviews();
        // Get the 3 most recent reviews
        setReviews(data.slice(0, 3));
      } catch {
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mx-auto mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-zinc-200 dark:bg-zinc-700 rounded-lg p-6">
                  <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-1/2 mb-4"></div>
                  <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-full mb-2"></div>
                  <div className="h-4 bg-zinc-300 dark:bg-zinc-600 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MessageCircle className="h-8 w-8 text-[#059669]" />
            <h2 className="text-3xl font-bold text-black dark:text-white">
              What Our Customers Say
            </h2>
          </div>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(Number(getAverageRating()))
                        ? 'text-yellow-400 fill-current'
                        : 'text-zinc-300 dark:text-zinc-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold text-black dark:text-white">
                {getAverageRating()}
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                ({reviews.length} reviews)
              </span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-black dark:text-white mb-2">
              No reviews yet
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">
              Be the first to share your experience with Shortcut Store
            </p>
            <Link
              to="/review-website"
              className="inline-flex items-center px-6 py-3 bg-[#059669] text-white font-medium rounded-lg hover:bg-[#059669]/90 transition-colors"
            >
              Be the First to Share Your Experience
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center space-x-1 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= review.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-zinc-300 dark:text-zinc-600'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 mb-4 line-clamp-4">
                  "{review.comment}"
                </p>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-black dark:text-white">
                    {review.username}
                  </span>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {formatDate(review.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {reviews.length > 0 && (
          <div className="text-center">
            <Link
              to="/review-website"
              className="inline-flex items-center px-6 py-3 bg-[#059669] text-white font-medium rounded-lg hover:bg-[#059669]/90 transition-colors"
            >
              Share Your Experience
            </Link>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ReviewSummary; 