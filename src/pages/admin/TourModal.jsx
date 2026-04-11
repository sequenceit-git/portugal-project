import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

/* ─────────────────────────────────────────────────────────────
   Empty tour template
───────────────────────────────────────────────────────────── */
const EMPTY_TOUR = {
  name: "",
  subtitle: "",
  category: "Tuk-Tuk",
  badge: "",
  badge_color: "primary",
  duration: "",
  guide_language: "English",
  meeting_point: "",
  highlights: "", // comma-separated in the form → stored as TEXT[]
  gallery: "", // newline-separated in the form  → stored as TEXT[]
  title_image: "",
  details: "",
  activity: "",
  // journey: "", // COMMENTED OUT - Using static itinerary from src/lib/staticItinerary.js
  rating: 5.0,
  review_count: 0,
  price_1_person: "",
  price_2_person: "",
  price_3_person: "",
  price_4_person: "",
  price_5_person: "",
  price_6_person: "",
};
/* ─────────────────────────────────────────────────────────────
   Tour Form Modal  (add & edit)
───────────────────────────────────────────────────────────── */
// Coerce any null/undefined DB value to "" so React controlled
// inputs never receive null as a value prop.
const nullToStr = (v) => (v == null ? "" : v);

const Field = ({
  label,
  field,
  type = "text",
  required,
  placeholder,
  form,
  errors,
  set,
}) => (
  <div>
    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
      {label}
      {required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      value={form[field]}
      onChange={set(field)}
      placeholder={placeholder}
      className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 ${
        errors[field]
          ? "border-red-400 bg-red-50"
          : "border-gray-200 focus:border-primary"
      }`}
    />
    {errors[field] && (
      <p className="text-red-500 text-[11px] mt-1">{errors[field]}</p>
    )}
  </div>
);

const TourModal = ({ tour, onClose, onSaved }) => {
  const [form, setForm] = useState(() => {
    if (!tour) return EMPTY_TOUR;
    // Sanitize every field: null → ""
    const base = Object.fromEntries(
      Object.entries(tour).map(([k, v]) => [k, nullToStr(v)]),
    );
    return {
      ...base,
      highlights: Array.isArray(tour.highlights)
        ? tour.highlights.join(", ")
        : nullToStr(tour.highlights),
      gallery: Array.isArray(tour.gallery)
        ? tour.gallery.join("\n")
        : nullToStr(tour.gallery),
    };
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const overlayRef = useRef(null);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.duration || isNaN(form.duration))
      e.duration = "Valid duration required";
    if (!form.title_image.trim()) e.title_image = "Title image URL is required";
    if (!form.details.trim()) e.details = "Description is required";
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      duration: parseFloat(form.duration),
      rating: parseFloat(form.rating) || 5.0,
      review_count: parseInt(form.review_count) || 0,
      price_1_person: form.price_1_person
        ? parseFloat(form.price_1_person)
        : null,
      price_2_person: form.price_2_person
        ? parseFloat(form.price_2_person)
        : null,
      price_3_person: form.price_3_person
        ? parseFloat(form.price_3_person)
        : null,
      price_4_person: form.price_4_person
        ? parseFloat(form.price_4_person)
        : null,
      price_5_person: form.price_5_person
        ? parseFloat(form.price_5_person)
        : null,
      price_6_person: form.price_6_person
        ? parseFloat(form.price_6_person)
        : null,
      highlights: form.highlights
        ? form.highlights
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      gallery: form.gallery
        ? form.gallery
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
    };
    delete payload.id;
    delete payload.created_at;

    let error;
    if (tour?.id) {
      ({ error } = await supabase
        .from("tours")
        .update(payload)
        .eq("id", tour.id));
    } else {
      ({ error } = await supabase.from("tours").insert([payload]));
    }

    setSaving(false);
    if (error) {
      alert("Error saving tour: " + error.message);
    } else {
      onSaved();
    }
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900">
            {tour ? "Edit Tour" : "Add New Tour"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5">
          {/* Row: name + subtitle */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Tour Name"
              field="name"
              required
              placeholder="e.g. Alfama & the Viewpoints"
              form={form}
              errors={errors}
              set={set}
            />
            <Field
              label="Subtitle"
              field="subtitle"
              placeholder="e.g. Lisbon's Hilltop Charm"
              form={form}
              errors={errors}
              set={set}
            />
          </div>

          {/* Row: category + badge + badge_color */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={form.category}
                onChange={set("category")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option>Tuk-Tuk</option>
                <option>Walking</option>
                <option>Boat</option>
                <option>Food</option>
              </select>
            </div>
            <Field
              label="Badge Text"
              field="badge"
              placeholder="e.g. Most Popular"
              form={form}
              errors={errors}
              set={set}
            />
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Badge Color
              </label>
              <select
                value={form.badge_color}
                onChange={set("badge_color")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                <option value="primary">Primary (orange)</option>
                <option value="amber">Amber (gold)</option>
                <option value="dark">Dark (black)</option>
              </select>
            </div>
          </div>

          {/* Row: duration */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="Duration (hours)"
              field="duration"
              type="number"
              required
              placeholder="e.g. 1.5"
              form={form}
              errors={errors}
              set={set}
            />
          </div>

          {/* Per-Person Pricing Tiers */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h3 className="text-sm font-bold text-blue-900 mb-4">
              Per-Person Pricing Tiers
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Field
                label="1 Person ($)"
                field="price_1_person"
                type="number"
                placeholder="e.g. 60"
                form={form}
                errors={errors}
                set={set}
              />
              <Field
                label="2 People ($/person)"
                field="price_2_person"
                type="number"
                placeholder="e.g. 35"
                form={form}
                errors={errors}
                set={set}
              />
              <Field
                label="3 People ($/person)"
                field="price_3_person"
                type="number"
                placeholder="e.g. 30"
                form={form}
                errors={errors}
                set={set}
              />
              <Field
                label="4 People ($/person)"
                field="price_4_person"
                type="number"
                placeholder="e.g. 30"
                form={form}
                errors={errors}
                set={set}
              />
              <Field
                label="5 People ($/person)"
                field="price_5_person"
                type="number"
                placeholder="e.g. 25"
                form={form}
                errors={errors}
                set={set}
              />
              <Field
                label="6+ People ($/person)"
                field="price_6_person"
                type="number"
                placeholder="e.g. 22"
                form={form}
                errors={errors}
                set={set}
              />
            </div>
            <p className="text-xs text-blue-700 mt-3 text-center">
              💡 For 6+ people, use the "6+ People" rate. Example: 7 people ×
              $22/person = $154 total
            </p>
          </div>

          {/* Row: guide_language + rating + review_count */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Guide Language"
              field="guide_language"
              placeholder="English"
              form={form}
              errors={errors}
              set={set}
            />
            <Field
              label="Rating (0–5)"
              field="rating"
              type="number"
              placeholder="5.0"
              form={form}
              errors={errors}
              set={set}
            />
            <Field
              label="Review Count"
              field="review_count"
              type="number"
              placeholder="0"
              form={form}
              errors={errors}
              set={set}
            />
          </div>

          {/* Meeting point */}
          <Field
            label="Meeting Point"
            field="meeting_point"
            placeholder="Leave blank for flexible pickup"
            form={form}
            errors={errors}
            set={set}
          />

          {/* Title image */}
          <Field
            label="Title Image URL"
            field="title_image"
            required
            placeholder="https://..."
            form={form}
            errors={errors}
            set={set}
          />

          {/* Preview thumbnail */}
          {form.title_image && (
            <img
              src={form.title_image}
              alt="preview"
              className="h-32 w-full object-cover rounded-xl border border-gray-200"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}

          {/* Highlights */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Highlights{" "}
              <span className="normal-case font-normal text-gray-400">
                (comma-separated)
              </span>
            </label>
            <input
              type="text"
              value={form.highlights}
              onChange={set("highlights")}
              placeholder="Miradouro da Graça, Portas do Sol, Santa Luzia"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.details}
              onChange={set("details")}
              rows={4}
              placeholder="Tour description..."
              className={`w-full border rounded-lg px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 resize-none ${
                errors.details
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-primary"
              }`}
            />
            {errors.details && (
              <p className="text-red-500 text-[11px] mt-1">{errors.details}</p>
            )}
          </div>

          {/* Activity */}
          <Field
            label="Activity Tags"
            field="activity"
            placeholder="e.g. Sightseeing · History · Photography"
            form={form}
            errors={errors}
            set={set}
          />

          {/* Gallery URLs */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Gallery Image URLs{" "}
              <span className="normal-case font-normal text-gray-400">
                (one per line)
              </span>
            </label>
            <textarea
              value={form.gallery}
              onChange={set("gallery")}
              rows={3}
              placeholder={"https://...\nhttps://..."}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>

          {/* JOURNEY FIELD - COMMENTED OUT (Using static itinerary instead)
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Journey / Itinerary{" "}
              <span className="normal-case font-normal text-gray-400">
                (one stop per line: Place Name | Short description)
              </span>
            </label>
            <textarea
              value={form.journey}
              onChange={set("journey")}
              rows={6}
              placeholder={
                "Miradouro da Graça | Meet point with panoramic views\nLisbon Cathedral | Historic center stop\nAlfama Alleys | Narrow streets and fado vibe\nComercio Square | Final stop by the river"
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none font-mono"
            />
          </div>
          */}

          {/* Note: Itinerary is now static and configured in src/lib/staticItinerary.js */}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="material-icons animate-spin text-base">
                  sync
                </span>
                Saving…
              </>
            ) : (
              <>
                <span className="material-icons text-base">save</span>
                {tour ? "Update Tour" : "Add Tour"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default TourModal;
