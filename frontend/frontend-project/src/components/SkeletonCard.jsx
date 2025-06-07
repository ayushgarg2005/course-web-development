import React from 'react';
import './output.css';

export const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 w-72 h-[400px]">
      {/* Image Placeholder */}
      <div className="w-full h-40 bg-gray-200 rounded-lg mb-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      </div>

      {/* Title Placeholder */}
      <div className="h-6 bg-gray-200 rounded mb-3 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      </div>

      {/* Description Placeholder */}
      <div className="h-4 bg-gray-200 rounded mb-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      </div>

      <div className="h-4 bg-gray-200 rounded mb-2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      </div>

      {/* Rating Placeholder */}
      <div className="h-4 bg-gray-200 rounded mb-2 relative overflow-hidden w-1/2">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      </div>

      {/* Price Placeholder */}
      <div className="h-6 bg-gray-200 rounded mb-2 relative overflow-hidden w-1/3">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
      </div>

      {/* Buttons Placeholder */}
      <div className="flex gap-2">
        <div className="h-8 bg-gray-200 rounded flex-grow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded flex-grow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
        </div>
      </div>
    </div>
  );
};
