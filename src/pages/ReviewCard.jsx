import { useState } from "react";

const ReviewCard = ({ review }) => {
  const [photoLoaded, setPhotoLoaded] = useState(false);

  return (
    <div className="break-inside-avoid mb-3 sm:mb-4">
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-md hover:shadow-lg transition-all border border-gray-100 flex flex-col">
        <div className="mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            {review.photo_url ? (
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                {!photoLoaded && (
                  <div className="absolute inset-0 w-full h-full rounded-full border-2 border-orange-100 bg-gray-200 animate-pulse" />
                )}
                <img
                  alt={review.name}
                  className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-orange-100 flex-shrink-0 ${photoLoaded ? "" : "invisible"}`}
                  src={review.photo_url}
                  loading="lazy"
                  decoding="async"
                  width="48"
                  height="48"
                  onLoad={() => setPhotoLoaded(true)}
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 border-2 border-orange-100 flex items-center justify-center text-primary font-bold text-sm sm:text-lg flex-shrink-0">
                {review.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                {review.name}
              </h4>
              <p className="text-[11px] text-gray-500 truncate">
                {review.country}
              </p>
            </div>
          </div>
          <div className="flex mt-2">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={`material-icons text-sm sm:text-base ${
                  i < review.rating ? "text-yellow-400" : "text-gray-200"
                }`}
              >
                star
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 italic mb-3 sm:mb-4 flex-grow leading-relaxed">
          &ldquo;{review.review_text}&rdquo;
        </p>
        {review.tour_name && (
          <div className="pt-4 border-t border-gray-100 mt-auto">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
              Tour: {review.tour_name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewCard;
