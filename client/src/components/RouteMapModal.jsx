import { useEffect } from "react";
import { Map, MapControls, MapMarker, MarkerContent, MarkerPopup, MarkerTooltip } from "@/components/ui/map";

// Per-tour route stops keyed by tour name (fallback: generic Lisbon route)
const TOUR_ROUTES = {
  "Alfama & the Viewpoints": {
    center: [-9.1327, 38.7148],
    zoom: 15,
    stops: [
      {
        id: 1,
        name: "Miradouro da Graça",
        icon: "visibility",
        description: "Starting point — panoramic views over Alfama & the Tagus",
        tip: "Look for Mama with the orange umbrella near the kiosk!",
        lng: -9.1305,
        lat: 38.7167,
      },
      {
        id: 2,
        name: "Portas do Sol",
        icon: "wb_sunny",
        description: "Iconic viewpoint overlooking the Alfama rooftops",
        tip: "Great spot for photos of the São Vicente de Fora church",
        lng: -9.1301,
        lat: 38.7132,
      },
      {
        id: 3,
        name: "Santa Luzia Viewpoint",
        icon: "photo_camera",
        description: "Final stop — tiled panels & river views",
        tip: "The azulejo panels here depict pre-1755 Lisbon — look closely!",
        lng: -9.1305,
        lat: 38.7119,
      },
    ],
  },
  "Belém & Alfama": {
    center: [-9.1580, 38.7120],
    zoom: 13,
    stops: [
      {
        id: 1,
        name: "Jerónimos Monastery",
        icon: "account_balance",
        description: "UNESCO World Heritage — the crown jewel of Manueline architecture",
        tip: "Entry is free on Sundays before 2 PM — plan ahead!",
        lng: -9.2064,
        lat: 38.6979,
      },
      {
        id: 2,
        name: "Belém Tower",
        icon: "castle",
        description: "Iconic 16th-century tower on the Tagus riverbank",
        tip: "Best photos from the riverbank path, early morning light is perfect",
        lng: -9.2160,
        lat: 38.6916,
      },
      {
        id: 3,
        name: "São Jorge Castle",
        icon: "fort",
        description: "Final stop — medieval castle with panoramic city views",
        tip: "The castle gardens are free to explore. Watch for peacocks!",
        lng: -9.1336,
        lat: 38.7139,
      },
    ],
  },
  "City Highlights Tuk-Tuk Tour": {
    center: [-9.1700, 38.7100],
    zoom: 13,
    stops: [
      {
        id: 1,
        name: "LX Factory",
        icon: "warehouse",
        description: "Trendy creative hub in a historic 19th-century factory complex",
        tip: "Sunday market is the best time — local designers, food & live music",
        lng: -9.1786,
        lat: 38.7024,
      },
      {
        id: 2,
        name: "Monument to the Discoveries",
        icon: "explore",
        description: "Belém's iconic riverside tribute to Portugal's Age of Discovery",
        tip: "Climb to the top for sweeping Tagus river views — only €3 entry",
        lng: -9.2055,
        lat: 38.6934,
      },
      {
        id: 3,
        name: "Praça do Comércio",
        icon: "location_city",
        description: "Grand riverside square — the heart of historic Lisbon",
        tip: "Walk through the Rua Augusta arch for the classic city entrance photo",
        lng: -9.1371,
        lat: 38.7079,
      },
    ],
  },
};

// Fallback generic route
const GENERIC_ROUTE = {
  center: [-9.1390, 38.7120],
  zoom: 13,
  stops: [
    {
      id: 1,
      name: "Miradouro da Graça",
      icon: "visibility",
      description: "Panoramic hilltop viewpoint over Lisbon",
      tip: "Best at sunset with a cold beer from the kiosk",
      lng: -9.1305,
      lat: 38.7167,
    },
    {
      id: 2,
      name: "Alfama Old Quarter",
      icon: "location_on",
      description: "Lisbon's oldest and most atmospheric neighbourhood",
      tip: "Follow the sound of Fado music through the narrow alleys",
      lng: -9.1327,
      lat: 38.7135,
    },
    {
      id: 3,
      name: "Castelo de São Jorge",
      icon: "fort",
      description: "Medieval castle with the best views in the city",
      tip: "Visit late afternoon — crowds thin out and light is golden",
      lng: -9.1336,
      lat: 38.7139,
    },
  ],
};

const STOP_COLORS = ["#f46a25", "#2c4c6e", "#16a34a"];
const STOP_LABELS = ["1st Stop", "2nd Stop", "3rd Stop"];

export default function RouteMapModal({ tourName, onClose }) {
  const route = TOUR_ROUTES[tourName] || GENERIC_ROUTE;
  const { center, zoom, stops } = route;

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              Route Map
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{tourName}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-600"
            aria-label="Close map"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        {/* Map */}
        <div style={{ height: "420px", position: "relative" }}>
          <Map
            center={center}
            zoom={zoom}
            theme="light"
            className="w-full h-full"
            minZoom={12}
            maxZoom={18}
            maxBounds={[
              [-9.3200, 38.6400],
              [-9.0500, 38.8000],
            ]}
          >
            <MapControls showZoom />

            {stops.map((stop, idx) => (
              <MapMarker
                key={stop.id}
                longitude={stop.lng}
                latitude={stop.lat}
              >
                <MarkerContent>
                  <div
                    className="flex items-center justify-center w-9 h-9 rounded-full shadow-lg border-2 border-white text-white cursor-pointer"
                    style={{ backgroundColor: STOP_COLORS[idx] }}
                    title={stop.name}
                  >
                    <span className="material-icons text-base">{stop.icon}</span>
                  </div>
                </MarkerContent>

                <MarkerTooltip>
                  <div className="bg-white px-2 py-1 rounded-lg shadow text-xs font-semibold text-slate-800 whitespace-nowrap">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1 align-middle"
                      style={{ backgroundColor: STOP_COLORS[idx] }}
                    />
                    {stop.name}
                  </div>
                </MarkerTooltip>

                <MarkerPopup>
                  <div className="bg-white rounded-xl shadow-xl p-4 w-56 border border-slate-100">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: STOP_COLORS[idx] }}
                      >
                        {STOP_LABELS[idx]}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">
                      {stop.name}
                    </h4>
                    <p className="text-xs text-slate-600 mb-2">{stop.description}</p>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5 flex gap-1.5 items-start">
                      <span className="material-icons text-amber-500 text-sm mt-0.5">
                        tips_and_updates
                      </span>
                      <p className="text-xs text-amber-800 leading-snug">{stop.tip}</p>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${stop.lat},${stop.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 flex items-center gap-1 text-xs text-primary font-semibold hover:underline"
                    >
                      <span className="material-icons text-sm">open_in_new</span>
                      Open in Google Maps
                    </a>
                  </div>
                </MarkerPopup>
              </MapMarker>
            ))}
          </Map>
        </div>

        {/* Stop legend */}
        <div className="px-5 py-3 border-t border-slate-100 flex flex-wrap gap-3">
          {stops.map((stop, idx) => (
            <div key={stop.id} className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: STOP_COLORS[idx] }}
              >
                {idx + 1}
              </span>
              <span className="text-xs text-slate-700 font-medium">{stop.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
