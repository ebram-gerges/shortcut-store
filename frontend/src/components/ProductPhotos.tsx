import React, { useState, useEffect } from 'react';
import { Camera, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';
import { ProductPhoto } from '../types/review';

interface ProductPhotosProps {
  productId: number;
  productSlug: string;
  productName: string;
}

const ProductPhotos: React.FC<ProductPhotosProps> = ({ productId, productSlug, productName }) => {
  const { user } = useAuth();
  const [photos, setPhotos] = useState<ProductPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        setLoading(true);
        const data = await reviewService.getProductPhotos(productId);
        setPhotos(data);
      } catch {
        setError('Failed to load photos');
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [productId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const displayedPhotos = showAll ? photos : photos.slice(0, 6);

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
        <div className="animate-pulse">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square bg-zinc-200 dark:bg-zinc-700 rounded-lg"></div>
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
          <Camera className="h-6 w-6 text-[#059669]" />
          <h3 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Customer Photos
          </h3>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            ({photos.length})
          </span>
        </div>
        {user ? (
          <div className="text-center">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Photo Upload Feature
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Photo upload functionality is currently under construction and will be available soon.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                Photo Upload Feature
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Photo upload functionality is currently under construction and will be available soon.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <div className="text-center py-8">
          <Camera className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
            No photos yet
          </h4>
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            Be the first to share how {productName} looks on you
          </p>
          {user && (
            <Link
              to={`/products/${productSlug}/upload-photo`}
              className="inline-flex items-center px-4 py-2 bg-[#059669] text-white font-medium rounded-lg hover:bg-[#059669]/90 transition-colors"
            >
              Be the First to Share a Photo
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {displayedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="group relative bg-zinc-100 dark:bg-zinc-700 rounded-lg overflow-hidden"
              >
                {/* Photo */}
                <div className="aspect-square relative">
                  <img
                    src={photo.photo}
                    alt={photo.caption || `${productName} on ${photo.username}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-end">
                    <div className="w-full p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="flex items-center space-x-2 mb-2">
                        {photo.user_avatar ? (
                          <img
                            src={photo.user_avatar}
                            alt={photo.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                            <User className="h-3 w-3 text-zinc-500" />
                          </div>
                        )}
                        <span className="text-white text-sm font-medium">
                          {photo.username}
                        </span>
                      </div>
                      {photo.caption && (
                        <p className="text-white text-xs line-clamp-2">
                          {photo.caption}
                        </p>
                      )}
                      <div className="text-white text-xs mt-1">
                        {formatDate(photo.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Caption (visible on mobile) */}
                <div className="p-3 md:hidden">
                  <div className="flex items-center space-x-2 mb-2">
                    {photo.user_avatar ? (
                      <img
                        src={photo.user_avatar}
                        alt={photo.username}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center">
                        <User className="h-3 w-3 text-zinc-500" />
                      </div>
                    )}
                    <span className="text-zinc-900 dark:text-white text-sm font-medium">
                      {photo.username}
                    </span>
                  </div>
                  {photo.caption && (
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2">
                      {photo.caption}
                    </p>
                  )}
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">
                    {formatDate(photo.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Show More/Less Button */}
          {photos.length > 6 && (
            <div className="text-center pt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-[#059669] hover:text-[#059669]/80 font-medium transition-colors"
              >
                {showAll ? 'Show Less' : `Show All ${photos.length} Photos`}
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

export default ProductPhotos; 