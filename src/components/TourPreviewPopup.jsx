import { useState } from "react";

const TourPreviewPopup = ({ tour, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!isOpen || !tour) return null;

  // Combine title_image with gallery for carousel
  const allImages =
    tour.gallery && tour.gallery.length > 0
      ? [tour.title_image, ...tour.gallery].filter(Boolean)
      : [tour.title_image].filter(Boolean);

  const rating = tour.rating || 0;
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const stars = [];
  for (let i = 0; i < fullStars; i++) stars.push(<span key={i}>★</span>);
  if (halfStar) stars.push(<span key="half">☆</span>);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1,
    );
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-2.5 sm:px-4 py-3 sm:py-8 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative bg-white rounded-lg sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2.5 sm:top-6 right-2.5 sm:right-6 text-gray-500 hover:text-gray-900 transition z-10 bg-white rounded-full p-1 sm:p-2 shadow-md hover:shadow-lg"
        >
          <span className="material-icons text-lg sm:text-2xl">close</span>
        </button>

        {/* Image Carousel */}
        <div className="relative w-full bg-black">
          <img
            src={allImages[currentImageIndex]}
            alt={`${tour.name} ${currentImageIndex}`}
            className="w-full h-40 sm:h-56 md:h-80 object-cover"
          />

          {/* Carousel Controls - Only show if more than 1 image */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-1.5 sm:p-3 rounded-full shadow-lg transition"
              >
                <span className="material-icons text-lg sm:text-2xl">
                  chevron_left
                </span>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-1.5 sm:p-3 rounded-full shadow-lg transition"
              >
                <span className="material-icons text-lg sm:text-2xl">
                  chevron_right
                </span>
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-[10px] sm:text-sm font-semibold px-2.5 sm:px-4 py-1 sm:py-2 rounded-full">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3 sm:p-6 md:p-8 space-y-4 sm:space-y-7">
          {/* Header Info */}
          <div className="space-y-2 sm:space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h2 className="text-lg sm:text-3xl font-bold text-slate-900 leading-snug pr-8 sm:pr-0">
                  {tour.name}
                </h2>
                <div className="flex items-center gap-2 sm:gap-3 mt-1.5 sm:mt-3">
                  <div className="flex text-yellow-400 text-xs sm:text-lg">
                    {stars}
                  </div>
                  <span className="text-slate-500 font-medium text-[11px] sm:text-sm">
                    {rating.toFixed(1)} ({tour.review_count || 0} reviews)
                  </span>
                </div>
              </div>
              <span className="inline-block bg-primary text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-4 py-1 sm:py-2 rounded-full whitespace-nowrap">
                {tour.category}
              </span>
            </div>
          </div>

          {/* Description */}
          {tour.details && (
            <div className="border-t border-b border-slate-200 py-3.5 sm:py-6">
              <p className="text-slate-600 text-sm sm:text-lg leading-relaxed">
                {tour.details}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
            <div className="bg-slate-50 p-2.5 sm:p-5 rounded-lg">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold mb-1 sm:mb-2">
                Duration
              </p>
              <p className="text-base sm:text-2xl font-bold text-slate-900">
                {tour.duration}h
              </p>
            </div>
            <div className="bg-slate-50 p-2.5 sm:p-5 rounded-lg">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold mb-1 sm:mb-2">
                Group
              </p>
              <p className="text-base sm:text-2xl font-bold text-slate-900">
                Private
              </p>
            </div>
            {tour.activity && (
              <div className="bg-slate-50 p-2.5 sm:p-5 rounded-lg">
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold mb-1 sm:mb-2">
                  Activity
                </p>
                <p className="text-[11px] sm:text-sm font-bold text-slate-900 line-clamp-2">
                  {tour.activity}
                </p>
              </div>
            )}
            {tour.price_1_person && (
              <div className="bg-primary/10 p-2.5 sm:p-5 rounded-lg">
                <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold mb-1 sm:mb-2">
                  Starting Price
                </p>
                <p className="text-base sm:text-2xl font-bold text-primary">
                  €{tour.price_1_person}
                  <span className="text-[10px] sm:text-sm font-normal text-slate-600 ml-1">
                    /person
                  </span>
                </p>
              </div>
            )}
          </div>

          {tour.meeting_point && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 sm:p-4">
              <p className="text-[10px] sm:text-xs text-slate-500 uppercase font-bold mb-1.5 sm:mb-2">
                Meeting Point
              </p>
              <div className="flex items-start gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-700">
                <span className="material-icons text-primary text-sm sm:text-base mt-0.5">
                  location_on
                </span>
                <span>{tour.meeting_point}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-slate-200 pt-3 sm:pt-6 flex gap-2 sm:gap-4">
            <button
              onClick={() =>
                (window.location.href = `/tour-details/${tour.id}`)
              }
              className="flex-1 border-2 border-primary text-primary font-semibold sm:font-bold py-2 sm:py-3 rounded-lg hover:bg-primary/5 transition text-xs sm:text-base"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourPreviewPopup;
