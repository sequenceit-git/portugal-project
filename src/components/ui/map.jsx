import { useState } from "react";
import { X, MapPin, ChevronUp, ChevronDown } from "lucide-react";

export const Map = ({ children, className = "" }) => {
  return (
    <div className={`relative w-full h-full bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

export const MapControls = ({ children, position = "top-right" }) => {
  const positionClasses = {
    "top-right": "top-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-left": "bottom-4 left-4",
  };

  return (
    <div className={`absolute ${positionClasses[position]} flex flex-col gap-2 z-10`}>
      {children}
    </div>
  );
};

export const MapMarker = ({
  lng,
  lat,
  children,
  onClick,
  active = false,
  className = "",
}) => {
  // Simple mercator projection (approximate)
  const projectLatLng = (lng, lat) => {
    const earthCircumference = 40075017;
    const mercatorLat = Math.log(Math.tan(((90 + lat) * Math.PI) / 360)) /
      (Math.PI / 180);

    const x = ((lng + 180) / 360) * 100;
    const y = ((90 - mercatorLat) / 180) * 100;

    return { x, y };
  };

  const { x, y } = projectLatLng(lng, lat);

  return (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all ${className} ${
        active ? "scale-125 z-20" : "z-10"
      }`}
      style={{ left: `${x}%`, top: `${y}%` }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export const MarkerContent = ({
  icon,
  active = false,
  badge = null,
  children,
}) => {
  return (
    <div
      className={`relative flex items-center justify-center transition-all ${
        active ? "scale-100" : "scale-75"
      }`}
    >
      {/* Outer ring */}
      <div
        className={`absolute inset-0 rounded-full ${
          active
            ? "bg-blue-500 scale-150"
            : "bg-blue-400"
        } opacity-75 animate-pulse`}
        style={{
          width: "32px",
          height: "32px",
        }}
      />

      {/* Inner pin */}
      <div className="relative z-10 flex items-center justify-center">
        <MapPin
          size={24}
          className={`${
            active ? "text-white drop-shadow-lg" : "text-white"
          }`}
          fill="currentColor"
        />
      </div>

      {/* Badge */}
      {badge && active && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap">
          {badge}
        </div>
      )}

      {children}
    </div>
  );
};

export const MarkerPopup = ({
  isOpen,
  onClose,
  title,
  description,
  image,
  badge,
  tip,
  category,
  neighborhood,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header with image */}
        {image && (
          <div className="relative h-48 bg-gray-200 overflow-hidden">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
            {badge && (
              <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {badge}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500">
                {neighborhood} • {category}
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <p className="text-gray-700 mb-3">{description}</p>

          {tip && (
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 text-sm">
              <p className="text-gray-700">
                <strong>💡 Local Tip:</strong> {tip}
              </p>
            </div>
          )}

          {children}
        </div>
      </div>
    </>
  );
};

export const MarkerTooltip = ({
  isVisible,
  title,
  children,
  position = "top",
}) => {
  if (!isVisible) return null;

  const positionClasses = {
    top: "bottom-full mb-2",
    bottom: "top-full mt-2",
    left: "right-full mr-2",
    right: "left-full ml-2",
  };

  return (
    <div
      className={`absolute ${positionClasses[position]} left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none`}
    >
      {title || children}
      <div
        className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
          position === "top"
            ? "top-full left-1/2 -translate-x-1/2 -translate-y-1"
            : position === "bottom"
              ? "bottom-full left-1/2 -translate-x-1/2 translate-y-1"
              : position === "left"
                ? "left-full top-1/2 -translate-y-1/2 translate-x-1"
                : "right-full top-1/2 -translate-y-1/2 -translate-x-1"
        }`}
      />
    </div>
  );
};

export default Map;
