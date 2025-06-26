import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Send, CheckCircle, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';
import { WebsiteReview, CreateWebsiteReviewRequest } from '../types/review';

const WebsiteReviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [experienceRating, setExperienceRating] = useState(0);
  const [hoverExperienceRating, setHoverExperienceRating] = useState(0);
  const [comment, setComment] = useState('');
  const [existingReview, setExistingReview] = useState<WebsiteReview | null>(null);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/review-website' } });
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchExistingReview = async () => {
      try {
        setLoading(true);
        const reviews = await reviewService.getMyWebsiteReviews();
        if (reviews.length > 0) {
          const userReview = reviews[0]; // Assuming one review per user
          setExistingReview(userReview);
          setRating(userReview.rating);
          setExperienceRating(userReview.experience_rating);
          setComment(userReview.comment);
        }
      } catch {
        setError('Failed to load existing review');
      } finally {
        setLoading(false);
      }
    };

    fetchExistingReview();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (rating === 0) {
      setError('Please select an overall rating');
      return;
    }

    if (experienceRating === 0) {
      setError('Please select an experience rating');
      return;
    }

    if (comment.trim().length < 10) {
      setError('Please write a review with at least 10 characters');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const reviewData: CreateWebsiteReviewRequest = {
        rating,
        experience_rating: experienceRating,
        comment: comment.trim()
      };

      if (existingReview) {
        await reviewService.updateWebsiteReview(existingReview.id, reviewData);
      } else {
        await reviewService.createWebsiteReview(reviewData);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
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

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 py-8 pt-[125px]">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </button>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-[#059669] rounded-full mb-4">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              {existingReview ? 'Edit Website Review' : 'Review Our Website'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Help us improve by sharing your experience with Shortcut Store
            </p>
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
                Thank you for your feedback. Redirecting to home page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Overall Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Overall Rating *
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

              {/* Experience Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Overall Experience *
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setExperienceRating(star)}
                      onMouseEnter={() => setHoverExperienceRating(star)}
                      onMouseLeave={() => setHoverExperienceRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          star <= (hoverExperienceRating || experienceRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-zinc-300 dark:text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  {experienceRating === 0 && 'Click to rate'}
                  {experienceRating === 1 && 'Poor'}
                  {experienceRating === 2 && 'Fair'}
                  {experienceRating === 3 && 'Good'}
                  {experienceRating === 4 && 'Very Good'}
                  {experienceRating === 5 && 'Excellent'}
                </p>
              </div>

              {/* Comment */}
              <div className="mb-6">
                <label htmlFor="comment" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Your Feedback *
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
                  placeholder="Tell us about your experience with our website. What did you like or dislike? Any suggestions for improvement? How was the shopping experience?"
                  required
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  {comment.length}/1000 characters (minimum 10)
                </p>
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
                  disabled={submitting || rating === 0 || experienceRating === 0 || comment.trim().length < 10}
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

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Your feedback helps us improve and provide better service to all our customers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WebsiteReviewPage; 