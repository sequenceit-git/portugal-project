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
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-900 transition z-10 bg-white rounded-full p-2 shadow-md hover:shadow-lg"
        >
          <span className="material-icons text-2xl">close</span>
        </button>

        {/* Image Carousel */}
        <div className="relative w-full bg-black">
          <img
            src={allImages[currentImageIndex]}
            alt={`${tour.name} ${currentImageIndex}`}
            className="w-full h-96 object-cover"
          />

          {/* Carousel Controls - Only show if more than 1 image */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={handlePrevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition"
              >
                <span className="material-icons">chevron_left</span>
              </button>
              <button
                onClick={handleNextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition"
              >
                <span className="material-icons">chevron_right</span>
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm font-semibold px-4 py-2 rounded-full">
                {currentImageIndex + 1} / {allImages.length}
              </div>
            </>
          )}
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-8">
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-900">
                  {tour.name}
                </h2>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex text-yellow-400 text-lg">{stars}</div>
                  <span className="text-slate-500 font-medium">
                    {rating.toFixed(1)} ({tour.review_count || 0} reviews)
                  </span>
                </div>
              </div>
              <span className="inline-block bg-primary text-white text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap">
                {tour.category}
              </span>
            </div>
          </div>

          {/* Description */}
          {tour.details && (
            <div className="border-t border-b border-slate-200 py-6">
              <p className="text-slate-600 text-lg leading-relaxed">
                {tour.details}
              </p>
            </div>
          )}

          {/* Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 p-5 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                Duration
              </p>
              <p className="text-2xl font-bold text-slate-900">
                {tour.duration}h
              </p>
            </div>
            <div className="bg-slate-50 p-5 rounded-lg">
              <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                Group Size
              </p>
              <p className="text-2xl font-bold text-slate-900">{tour.people}</p>
            </div>
            {tour.activity && (
              <div className="bg-slate-50 p-5 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                  Activity
                </p>
                <p className="text-sm font-bold text-slate-900">
                  {tour.activity}
                </p>
              </div>
            )}
            {tour.price && (
              <div className="bg-primary/10 p-5 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                  Price
                </p>
                <p className="text-2xl font-bold text-primary">
                  €{tour.price}
                  <span className="text-sm font-normal text-slate-600 block">
                    /person
                  </span>
                </p>
              </div>
            )}
          </div>
          
          <div>Special Instructions:</div>

          {/* Footer */}
          <div className="border-t border-slate-200 pt-6 flex gap-4">
            <button
              onClick={() =>
                (window.location.href = `/tour-details/${tour.id}`)
              }
              className="flex-1 border-2 border-slate-300 text-slate-900 font-bold py-3 rounded-lg hover:bg-slate-50 transition"
            >
              View more Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourPreviewPopup;
