import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Camera, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { reviewService } from '../services/reviewService';
import { getProductById } from '../services/productService';
import { ProductPhoto, CreateProductPhotoRequest } from '../types/review';
import { Product } from '../types/product';

const ProductPhotoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [existingPhoto, setExistingPhoto] = useState<ProductPhoto | null>(null);

  // Check authentication
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/products/${id}/upload-photo` } });
      return;
    }
  }, [user, navigate, id]);

  useEffect(() => {
    if (!id || !user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, photos] = await Promise.all([
          getProductById(Number(id)),
          reviewService.getMyProductPhotos()
        ]);
        
        setProduct(productData);
        
        // Check if user has already uploaded a photo for this product
        const userPhoto = photos.find((photo: ProductPhoto) => photo.product === Number(id));
        if (userPhoto) {
          setExistingPhoto(userPhoto);
          setCaption(userPhoto.caption || '');
          setPreviewUrl(userPhoto.photo);
        }
      } catch {
        setError('Failed to load product information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;

    if (!selectedFile && !existingPhoto) {
      setError('Please select an image to upload');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      if (existingPhoto && !selectedFile) {
        // Update caption only
        await reviewService.updateProductPhoto(existingPhoto.id, { caption });
      } else if (selectedFile) {
        const photoData: CreateProductPhotoRequest = {
          product: product.id,
          photo: selectedFile,
          caption: caption.trim() || undefined
        };

        if (existingPhoto) {
          await reviewService.updateProductPhoto(existingPhoto.id, photoData);
        } else {
          await reviewService.createProductPhoto(photoData);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/products/${product.id}`);
      }, 2000);
    } catch {
      setError('Failed to upload photo. Please try again.');
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
            onClick={() => navigate(`/products/${product.id}`)}
            className="inline-flex items-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </button>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {existingPhoto ? 'Update Photo' : 'Share Your Photo'}
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Show how {product.name} looks on you!
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

        {/* Photo Upload Form */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 shadow-sm border border-zinc-200 dark:border-zinc-700">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
                Photo Uploaded!
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400">
                Thank you for sharing your photo. Redirecting to product page...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Photo Upload */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Your Photo *
                </label>
                
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-zinc-300 dark:border-zinc-600"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-64 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#059669] transition-colors"
                  >
                    <Camera className="h-12 w-12 text-zinc-400 mb-4" />
                    <p className="text-zinc-600 dark:text-zinc-400 text-center mb-2">
                      Click to upload your photo
                    </p>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                      JPG, PNG up to 5MB
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Caption */}
              <div className="mb-6">
                <label htmlFor="caption" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                  Caption (Optional)
                </label>
                <textarea
                  id="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
                  placeholder="Add a caption to your photo (optional)"
                  maxLength={200}
                />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  {caption.length}/200 characters
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
                  disabled={submitting || (!selectedFile && !existingPhoto)}
                  className="inline-flex items-center px-6 py-3 bg-[#059669] text-white font-semibold rounded-lg hover:bg-[#059669]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {existingPhoto ? 'Update Photo' : 'Upload Photo'}
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
            Share how the product looks on you to help other customers make their decision!
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPhotoPage; 