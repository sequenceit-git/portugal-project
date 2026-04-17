import { useState } from "react";

const GalleryImageCard = ({ item, onClick, onError }) => {
  const [loaded, setLoaded] = useState(false);

  // Truncate tour name to 3 words with ellipsis
  const truncateTourName = (name) => {
    if (!name) return "";
    const words = name.split(" ");
    if (words.length > 3) {
      return words.slice(0, 3).join(" ") + "...";
    }
    return name;
  };

  return (
    <div
      className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 mb-3 sm:mb-4 break-inside-avoid"
      onClick={onClick}
      style={{ minHeight: 180 }}
    >
      {/* Skeleton Loader */}
      {!loaded && (
        <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse z-10" />
      )}
      {/* Image */}
      <img
        src={item.image_url}
        alt={item.description || item.tour_name}
        className={`w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500 block ${loaded ? "" : "invisible"}`}
        loading="lazy"
        decoding="async"
        width="400"
        height="300"
        onLoad={() => setLoaded(true)}
        onError={onError}
      />

      {/* Tag Badge */}
      <div className="absolute top-3 left-3 z-20">
        <span className="inline-block bg-orange-100 text-orange-700 border border-orange-200 text-[9px] sm:text-[10px] font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-wide shadow-md">
          {truncateTourName(item.tour_name)}
        </span>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-end p-4 z-20">
        <div className="text-white text-right">
          {item.description && (
            <p className="text-xs sm:text-sm leading-relaxed sm:leading-relaxed mb-3 text-white/90">
              {item.description}
            </p>
          )}
          <div className="flex items-center gap-2 text-white/80 text-xs">
            <span className="material-icons text-sm">zoom_in</span>
            <span>Click to view</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryImageCard;
