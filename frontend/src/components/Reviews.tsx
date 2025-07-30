import React, { useEffect, useState } from 'react';
import { reviewService } from '../services/reviewService';

interface Review {
  id: number;
  user: {
    username: string;
  };
  rating: number;
  comment: string;
  created_at: string;
}

interface ReviewsProps {
  productId: string;
}

const Reviews: React.FC<ReviewsProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getProductReviews(productId);
        setReviews(data);
      } catch (error) {
        console.error('Failed to fetch reviews', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  if (loading) {
    return <div>Loading reviews...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
      {reviews.length > 0 ? (
        <ul>
          {reviews.map((review) => (
            <li key={review.id} className="mb-4">
              <p><strong>{review.user.username}</strong> - {review.rating}/5</p>
              <p>{review.comment}</p>
              <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>No reviews yet.</p>
      )}
    </div>
  );
};

export default Reviews;
