/**
 * MeetingPoints — dropdown selector for 3 meeting point options
 * with a "View on Google Maps" link for the selected point.
 */
import { useState } from "react";

const MEETING_POINTS = [
  {
    id: 1,
    name: "Vinhos de Lisboa Time Out Market",
    note: "Please stay next to Vinhos de Lisboa wine shop. Our tour guide will contact you 5–10 min before the tour start.",
    url: "https://maps.app.goo.gl/zLty5GXPme8Lk5Gn7?g_st=awb",
    icon: "wine_bar",
    color: "bg-orange-500",
  },
  {
    id: 2,
    name: "Fado Museum",
    note: "Please stay in front of Fado Museum.",
    url: "https://maps.app.goo.gl/Z5KGaJVLcYYdvqDm9?g_st=awb",
    icon: "museum",
    color: "bg-blue-600",
  },
  {
    id: 3,
    name: "Rossio Square (train station)",
    note: "Stay in front of the train station.",
    url: "https://maps.app.goo.gl/jxk9ztDvuZBMwRVdA?g_st=awb",
    icon: "train",
    color: "bg-green-600",
  },
];

export { MEETING_POINTS };

export default function MeetingPoints({ compact = false, value, onChange }) {
  // If parent controls selection (value + onChange), use that; otherwise local state
  const [localSelected, setLocalSelected] = useState(MEETING_POINTS[0].id);
  const selectedId = value ?? localSelected;
  const setSelectedId = onChange ?? setLocalSelected;

  const selected = MEETING_POINTS.find((mp) => mp.id === selectedId) || MEETING_POINTS[0];

  return (
    <div className="space-y-3">
      <h4 className={`font-bold text-slate-900 ${compact ? "text-sm" : "text-base"}`}>
        Meeting Point
      </h4>
      <p className="text-xs text-slate-500">
        Choose your preferred meeting point below.
      </p>

      {/* Dropdown */}
      <div className="relative">
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(Number(e.target.value))}
          className="w-full appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-10 text-sm font-semibold text-slate-800 outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
        >
          {MEETING_POINTS.map((mp) => (
            <option key={mp.id} value={mp.id}>
              {mp.name}
            </option>
          ))}
        </select>
        <span className="material-icons absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">
          expand_more
        </span>
      </div>

      {/* Selected point details + Google Maps link */}
      <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <div
          className={`w-8 h-8 ${selected.color} rounded-lg flex items-center justify-center shrink-0 shadow-sm`}
        >
          <span className="material-icons text-white text-sm">{selected.icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-slate-500 leading-relaxed">{selected.note}</p>
          <a
            href={selected.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary hover:text-primary-dark transition"
          >
            <span className="material-icons text-sm">location_on</span>
            View on Google Maps
            <span className="material-icons text-xs">open_in_new</span>
          </a>
        </div>
      </div>

      <p className="text-xs text-slate-400 flex items-start gap-1.5 mt-2">
        <span className="material-icons text-xs mt-0.5">info</span>
        <span>
          For hotel pickup, please mention your address within 2 km of any
          meeting point above.
        </span>
      </p>
    </div>
  );
}
