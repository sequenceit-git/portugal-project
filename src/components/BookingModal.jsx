import React from "react";

const BookingModal = ({
  tour,
  travelers,
  setTravelers,
  date,
  setDate,
  language,
  setLanguage,
  adding,
  onClose,
  onAddToCart,
}) => {
  if (!tour) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <div className="sticky top-0 right-0 p-4 flex justify-end bg-white rounded-t-2xl">
          <button
            onClick={onClose}
            className="bg-white rounded-full p-2 hover:bg-gray-100 transition-colors"
          >
            <span className="material-icons text-gray-600">close</span>
          </button>
        </div>

        {/* Tour Image */}
        <div className="w-full h-64 overflow-hidden bg-gray-200">
          <img
            src={tour.title_image}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Title and Badge */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{tour.name}</h2>
              {tour.subtitle && (
                <p className="text-lg text-primary font-semibold mt-1">{tour.subtitle}</p>
              )}
            </div>
            {tour.badge && (
              <span className="bg-primary text-white px-4 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                {tour.badge}
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="flex text-yellow-400">
              {Array.from({ length: Math.floor(tour.rating) }).map((_, i) => (
                <span key={i} className="material-icons text-xl">star</span>
              ))}
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {Number(tour.rating).toFixed(1)}
            </span>
            <span className="text-sm text-gray-500">({tour.review_count} reviews)</span>
          </div>

          {/* Description */}
          <div>
            <p className="text-gray-600 text-base leading-relaxed mb-4">
              {tour.details}
            </p>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="text-center">
              <span className="material-icons text-primary text-2xl block mb-1">schedule</span>
              <p className="text-sm text-gray-600">{tour.duration} Hours</p>
            </div>
            <div className="text-center">
              <span className="material-icons text-primary text-2xl block mb-1">language</span>
              <p className="text-sm text-gray-600">{tour.guide_language || "English"}</p>
            </div>
            <div className="text-center">
              <span className="material-icons text-primary text-2xl block mb-1">price_tag</span>
              <p className="text-sm text-gray-600">${Number(tour.price_1_person).toFixed(0)}</p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Booking Details</h3>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                <span className="material-icons text-sm align-text-bottom mr-1">groups</span>
                Number of Travelers
              </label>
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Traveler" : "Travelers"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                <span className="material-icons text-sm align-text-bottom mr-1">calendar_today</span>
                Select Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2.5">
                <span className="material-icons text-sm align-text-bottom mr-1">language</span>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-white text-gray-900"
              >
                {["English", "Portuguese", "Spanish", "French", "Italian"].map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onAddToCart}
              disabled={adding || !date}
              className={`flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/30 ${
                adding ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              <span className="material-icons text-base">{adding ? "hourglass_empty" : "add_shopping_cart"}</span>
              {adding ? "Adding..." : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
