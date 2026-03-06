import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

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
  people: 6,
  guide_language: "English",
  meeting_point: "",
  highlights: "", // comma-separated in the form → stored as TEXT[]
  gallery: "", // newline-separated in the form  → stored as TEXT[]
  title_image: "",
  details: "",
  activity: "",
  journey: "",
  rating: 5.0,
  review_count: 0,
  price: "",
};

/* ─────────────────────────────────────────────────────────────
   Supabase Auth Login Gate (email + password)
───────────────────────────────────────────────────────────── */
const LoginGate = ({ onUnlock }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if already logged in on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.app_metadata?.role === "admin") {
        onUnlock();
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: pw,
      });
      if (authError) throw authError;
      // Check admin role
      if (data.user?.app_metadata?.role !== "admin") {
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }
      onUnlock();
    } catch (err) {
      setError(err.message || "Login failed");
      setPw("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm border border-gray-100">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="material-icons text-primary text-3xl">
              admin_panel_settings
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Admin Login</h1>
          <p className="text-sm text-gray-400">Tours management dashboard</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="admin@tukinlisbon.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 focus:border-primary"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setError("");
              }}
              placeholder="Enter admin password"
              className={`w-full border rounded-xl px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-primary/30 ${
                error
                  ? "border-red-400 bg-red-50"
                  : "border-gray-200 focus:border-primary"
              }`}
              required
            />
            {error && (
              <p className="text-red-500 text-xs mt-1.5">{error}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <span className="material-icons animate-spin text-base">sync</span>}
            {loading ? "Signing in…" : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Tour Form Modal  (add & edit)
───────────────────────────────────────────────────────────── */
// Coerce any null/undefined DB value to "" so React controlled
// inputs never receive null as a value prop.
const nullToStr = (v) => (v == null ? "" : v);

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
      people: parseInt(form.people) || 6,
      rating: parseFloat(form.rating) || 5.0,
      review_count: parseInt(form.review_count) || 0,
      price: form.price ? parseFloat(form.price) : null,
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

  const Field = ({ label, field, type = "text", required, placeholder }) => (
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
            />
            <Field
              label="Subtitle"
              field="subtitle"
              placeholder="e.g. Lisbon's Hilltop Charm"
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

          {/* Row: duration + people + price */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Duration (hours)"
              field="duration"
              type="number"
              required
              placeholder="e.g. 1.5"
            />
            <Field
              label="Max People"
              field="people"
              type="number"
              placeholder="6"
            />
            <Field
              label="Price (€/person)"
              field="price"
              type="number"
              placeholder="e.g. 35"
            />
          </div>

          {/* Row: guide_language + rating + review_count */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Field
              label="Guide Language"
              field="guide_language"
              placeholder="English"
            />
            <Field
              label="Rating (0–5)"
              field="rating"
              type="number"
              placeholder="5.0"
            />
            <Field
              label="Review Count"
              field="review_count"
              type="number"
              placeholder="0"
            />
          </div>

          {/* Meeting point */}
          <Field
            label="Meeting Point"
            field="meeting_point"
            placeholder="Leave blank for flexible pickup"
          />

          {/* Title image */}
          <Field
            label="Title Image URL"
            field="title_image"
            required
            placeholder="https://..."
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

          {/* Journey */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Journey / Itinerary
            </label>
            <textarea
              value={form.journey}
              onChange={set("journey")}
              rows={3}
              placeholder="Detailed journey description..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
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

/* ─────────────────────────────────────────────────────────────
   Delete Confirm Modal
───────────────────────────────────────────────────────────── */
const DeleteConfirm = ({ tour, onCancel, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("tours").delete().eq("id", tour.id);
    setDeleting(false);
    if (error) {
      alert("Error deleting tour: " + error.message);
    } else {
      onDeleted();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="material-icons text-red-500 text-3xl">
            delete_forever
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Delete Tour?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          <span className="font-semibold text-gray-800">"{tour.name}"</span>{" "}
          will be permanently deleted from the database. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="material-icons animate-spin text-base">
                  sync
                </span>
                Deleting…
              </>
            ) : (
              <>
                <span className="material-icons text-base">delete</span>
                Yes, Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Badge chip helper
───────────────────────────────────────────────────────────── */
const badgeStyle = {
  amber: "bg-amber-100 text-amber-700",
  primary: "bg-primary/10 text-primary",
  dark: "bg-gray-100 text-gray-700",
};

/* ─────────────────────────────────────────────────────────────
   Bookings Manager
───────────────────────────────────────────────────────────── */
const STATUS_STYLE = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

const BookingsManager = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [expanding, setExpanding] = useState(null);

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const setStatus = async (id, status) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
    if (error) {
      alert("Update failed: " + error.message);
      return;
    }
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
  };

  const counts = {
    all: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const totalRevenue = bookings
    .filter((b) => b.status === "confirmed")
    .reduce((s, b) => s + Number(b.total_amount || 0), 0);

  const visible = bookings.filter((b) => {
    const matchTab = filter === "all" || b.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (b.first_name + " " + (b.last_name || "")).toLowerCase().includes(q) ||
      (b.tour_name || "").toLowerCase().includes(q) ||
      (b.email || "").toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: "confirmation_number",
            label: "Total Bookings",
            value: counts.all,
            color: "bg-primary/10 text-primary",
          },
          {
            icon: "hourglass_top",
            label: "Pending",
            value: counts.pending,
            color: "bg-amber-100 text-amber-600",
          },
          {
            icon: "check_circle",
            label: "Confirmed",
            value: counts.confirmed,
            color: "bg-green-100 text-green-600",
          },
          {
            icon: "payments",
            label: "Revenue (confirmed)",
            value: `€${totalRevenue.toFixed(2)}`,
            color: "bg-blue-100 text-blue-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}
            >
              <span className="material-icons text-xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs + search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 px-4 sm:px-5 pt-4 pb-3 border-b border-gray-100">
          {/* Filter tabs — horizontally scrollable on mobile */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
            {["all", "pending", "confirmed", "cancelled"].map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                  filter === s
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {s} <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
              </button>
            ))}
          </div>
          {/* Search — full width on mobile */}
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, tour, email…"
              className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* Loading / empty */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-icons animate-spin text-primary text-3xl">
              sync
            </span>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <span className="material-icons text-4xl">inbox</span>
            <p className="font-semibold">No bookings found</p>
          </div>
        ) : (
          <>
            {/* ── Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {[
                      "Guest",
                      "Tour",
                      "Date & Time",
                      "Passengers",
                      "Amount",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((b) => (
                    <>
                      <tr key={b.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">
                            {b.first_name} {b.last_name}
                          </p>
                          <p className="text-xs text-gray-400">{b.email}</p>
                          {b.phone && (
                            <p className="text-xs text-gray-400">{b.phone}</p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">
                            {b.tour_name || "—"}
                          </p>
                          <p className="text-xs text-gray-400">{b.language}</p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-gray-800">
                            {b.booking_date}
                          </p>
                          <p className="text-xs text-gray-400">
                            {b.booking_time}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {b.adults > 0 && (
                              <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {b.adults} Adult{b.adults > 1 ? "s" : ""}
                              </span>
                            )}
                            {b.youth > 0 && (
                              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                                {b.youth} Youth
                              </span>
                            )}
                            {b.seniors > 0 && (
                              <span className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full">
                                {b.seniors} Senior{b.seniors > 1 ? "s" : ""}
                              </span>
                            )}
                            {b.infants > 0 && (
                              <span className="bg-pink-50 text-pink-700 text-xs px-2 py-0.5 rounded-full">
                                {b.infants} Infant{b.infants > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {b.total_guests} total
                          </p>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-bold text-gray-900">
                            €{Number(b.total_amount || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400">
                            {b.payment_method}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_STYLE[b.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            <span className="material-icons text-[11px]">
                              {b.status === "confirmed"
                                ? "check_circle"
                                : b.status === "cancelled"
                                  ? "cancel"
                                  : "hourglass_top"}
                            </span>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            {b.status !== "confirmed" && (
                              <button
                                onClick={() => setStatus(b.id, "confirmed")}
                                className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                <span className="material-icons text-xs">
                                  check
                                </span>
                                Approve
                              </button>
                            )}
                            {b.status !== "cancelled" && (
                              <button
                                onClick={() => setStatus(b.id, "cancelled")}
                                className="flex items-center gap-1 text-xs border border-red-200 text-red-500 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg transition"
                              >
                                <span className="material-icons text-xs">
                                  close
                                </span>
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setExpanding(expanding === b.id ? null : b.id)
                              }
                              className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold px-3 py-1.5 rounded-lg transition"
                            >
                              <span className="material-icons text-xs">
                                {expanding === b.id
                                  ? "expand_less"
                                  : "expand_more"}
                              </span>
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanding === b.id && (
                        <tr key={`exp-${b.id}`} className="bg-gray-50/80">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
                              {[
                                { label: "Booking ID", value: `#${b.id}` },
                                {
                                  label: "Booked On",
                                  value: new Date(b.created_at).toLocaleString(
                                    "en-GB",
                                  ),
                                },
                                {
                                  label: "Subtotal",
                                  value: `€${Number(b.subtotal || 0).toFixed(2)}`,
                                },
                                {
                                  label: "Service Fee",
                                  value: `€${Number(b.service_fee || 0).toFixed(2)}`,
                                },
                                {
                                  label: "Meeting Point",
                                  value: b.special_requests || "None",
                                },
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {label}
                                  </p>
                                  <p className="text-gray-800 font-semibold mt-0.5">
                                    {value}
                                  </p>
                                </div>
                              ))}
                              {b.special_requests && (
                                <div className="col-span-2 md:col-span-3">
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Special Requests
                                  </p>
                                  <p className="text-gray-800 mt-0.5">
                                    {b.special_requests}
                                  </p>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile / Tablet cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {visible.map((b) => (
                <div key={b.id} className="p-4 space-y-3">
                  {/* Row 1: guest info + status + amount */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {b.first_name} {b.last_name}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {b.email}
                      </p>
                      {b.phone && (
                        <p className="text-xs text-gray-400">{b.phone}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-gray-900">
                        €{Number(b.total_amount || 0).toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${STATUS_STYLE[b.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        <span className="material-icons text-[10px]">
                          {b.status === "confirmed"
                            ? "check_circle"
                            : b.status === "cancelled"
                              ? "cancel"
                              : "hourglass_top"}
                        </span>
                        {b.status}
                      </span>
                    </div>
                  </div>
                  {/* Row 2: tour + date */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded">
                      {b.tour_name || "—"}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {b.booking_date} {b.booking_time && `· ${b.booking_time}`}
                    </span>
                    {b.total_guests > 0 && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {b.total_guests} guest{b.total_guests > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {/* Row 3: actions */}
                  <div className="flex gap-2 flex-wrap">
                    {b.status !== "confirmed" && (
                      <button
                        onClick={() => setStatus(b.id, "confirmed")}
                        className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white font-bold px-3 py-2 rounded-lg transition"
                      >
                        <span className="material-icons text-xs">check</span>
                        Approve
                      </button>
                    )}
                    {b.status !== "cancelled" && (
                      <button
                        onClick={() => setStatus(b.id, "cancelled")}
                        className="flex items-center gap-1 text-xs border border-red-200 text-red-500 hover:bg-red-50 font-bold px-3 py-2 rounded-lg transition"
                      >
                        <span className="material-icons text-xs">close</span>
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setExpanding(expanding === b.id ? null : b.id)
                      }
                      className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg transition"
                    >
                      <span className="material-icons text-xs">
                        {expanding === b.id ? "expand_less" : "expand_more"}
                      </span>
                      Details
                    </button>
                  </div>
                  {/* Expandable details */}
                  {expanding === b.id && (
                    <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                      {[
                        { label: "Booking ID", value: `#${b.id}` },
                        {
                          label: "Booked On",
                          value: new Date(b.created_at).toLocaleDateString(
                            "en-GB",
                          ),
                        },
                        {
                          label: "Subtotal",
                          value: `€${Number(b.subtotal || 0).toFixed(2)}`,
                        },
                        {
                          label: "Service Fee",
                          value: `€${Number(b.service_fee || 0).toFixed(2)}`,
                        },
                        { label: "Payment", value: b.payment_method || "—" },
                        { label: "Language", value: b.language || "—" },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                            {label}
                          </p>
                          <p className="text-gray-800 font-semibold mt-0.5">
                            {value}
                          </p>
                        </div>
                      ))}
                      {b.special_requests && (
                        <div className="col-span-2">
                          <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                            Special Requests
                          </p>
                          <p className="text-gray-800 mt-0.5">
                            {b.special_requests}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Reviews Manager  (add / edit / delete)
───────────────────────────────────────────────────────────── */
const EMPTY_REVIEW = {
  name: "",
  country: "",
  tour_name: "",
  rating: 5,
  review_text: "",
  photo_url: "",
};

const ReviewModal = ({ review, onClose, onSaved }) => {
  const [form, setForm] = useState(
    review ? { ...review } : { ...EMPTY_REVIEW },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const overlayRef = useRef(null);

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    if (!form.review_text.trim()) {
      setError("Review text is required.");
      return;
    }
    if (!form.rating || form.rating < 1 || form.rating > 5) {
      setError("Rating must be 1–5.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      name: form.name.trim(),
      country: form.country.trim(),
      tour_name: form.tour_name.trim(),
      rating: parseInt(form.rating),
      review_text: form.review_text.trim(),
      photo_url: form.photo_url.trim(),
    };
    let err;
    if (review?.id) {
      ({ error: err } = await supabase
        .from("reviews")
        .update(payload)
        .eq("id", review.id));
    } else {
      ({ error: err } = await supabase.from("reviews").insert([payload]));
    }
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    onSaved();
  };

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-extrabold text-gray-900">
            {review ? "Edit Review" : "Add Review"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition"
          >
            <span className="material-icons">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Sarah & Tom"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Country
              </label>
              <input
                type="text"
                value={form.country}
                onChange={set("country")}
                placeholder="e.g. USA"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Tour Name
              </label>
              <input
                type="text"
                value={form.tour_name}
                onChange={set("tour_name")}
                placeholder="e.g. Alfama & the Viewpoints"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Rating (1–5) <span className="text-red-400">*</span>
              </label>
              <select
                value={form.rating}
                onChange={set("rating")}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)} ({n})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Photo URL
            </label>
            <input
              type="text"
              value={form.photo_url}
              onChange={set("photo_url")}
              placeholder="https://... (optional)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          {form.photo_url && (
            <img
              src={form.photo_url}
              alt="preview"
              className="h-16 w-16 rounded-full object-cover border border-gray-200"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          )}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Review Text <span className="text-red-400">*</span>
            </label>
            <textarea
              value={form.review_text}
              onChange={set("review_text")}
              rows={4}
              placeholder="Guest's review..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
        </div>

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
                {review ? "Update" : "Add Review"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const DeleteReviewConfirm = ({ review, onCancel, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);
  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase
      .from("reviews")
      .delete()
      .eq("id", review.id);
    setDeleting(false);
    if (error) {
      alert("Error: " + error.message);
      return;
    }
    onDeleted();
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <span className="material-icons text-red-500 text-3xl">
            delete_forever
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">
          Delete Review?
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Review by{" "}
          <span className="font-semibold text-gray-800">{review.name}</span>{" "}
          will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <span className="material-icons animate-spin text-base">
                  sync
                </span>
                Deleting…
              </>
            ) : (
              <>
                <span className="material-icons text-base">delete</span>Yes,
                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Gallery Manager  (upload / delete gallery images)
───────────────────────────────────────────────────────────── */
const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [form, setForm] = useState({ tour_name: "", description: "" });
  const [filePreview, setFilePreview] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setImages(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setUploadError("File must be under 5 MB.");
      return;
    }
    setFile(f);
    setFilePreview(URL.createObjectURL(f));
    setUploadError("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError("Please select an image.");
      return;
    }
    if (!form.tour_name.trim()) {
      setUploadError("Tour / tag name is required.");
      return;
    }

    setUploading(true);
    setUploadError("");

    const ext = file.name.split(".").pop();
    const fileName = `gallery_${Date.now()}.${ext}`;

    // Upload to storage
    const { error: storageErr } = await supabase.storage
      .from("gallery")
      .upload(fileName, file, { cacheControl: "3600", upsert: false });

    if (storageErr) {
      setUploadError("Upload failed: " + storageErr.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("gallery")
      .getPublicUrl(fileName);

    const { error: dbErr } = await supabase.from("gallery").insert([
      {
        image_url: urlData.publicUrl,
        tour_name: form.tour_name.trim(),
        description: form.description.trim() || null,
      },
    ]);

    if (dbErr) {
      setUploadError("Database error: " + dbErr.message);
      setUploading(false);
      return;
    }

    // Reset form
    setFile(null);
    setFilePreview(null);
    setForm({ tour_name: "", description: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
    setUploading(false);
    fetchImages();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    // Extract filename from URL to delete from storage
    try {
      const url = new URL(deleteTarget.image_url);
      const parts = url.pathname.split("/");
      const fileName = parts[parts.length - 1];
      await supabase.storage.from("gallery").remove([fileName]);
    } catch (_) {
      /* storage delete is best-effort */
    }

    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", deleteTarget.id);

    setDeleting(false);
    setDeleteTarget(null);
    if (!error) fetchImages();
    else alert("Delete failed: " + error.message);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Gallery</h2>
          <p className="text-sm text-gray-400 mt-0.5">
            {images.length} photo{images.length !== 1 ? "s" : ""} in gallery
          </p>
        </div>
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-icons text-primary text-base">
            add_photo_alternate
          </span>
          Upload New Photo
        </h3>
        <form onSubmit={handleUpload} className="space-y-4">
          {/* File drop zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-200 hover:border-primary/40 rounded-xl p-6 text-center cursor-pointer transition-colors bg-gray-50 hover:bg-primary/5"
          >
            {filePreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={filePreview}
                  alt="Preview"
                  className="max-h-40 rounded-lg object-contain shadow"
                />
                <p className="text-xs text-gray-500">{file?.name}</p>
                <p className="text-xs text-primary font-semibold">
                  Click to change
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <span className="material-icons text-4xl">cloud_upload</span>
                <p className="text-sm font-semibold">Click to select image</p>
                <p className="text-xs">JPG, PNG, WEBP · Max 5 MB</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Tour / Tag Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.tour_name}
                onChange={(e) =>
                  setForm((f) => ({ ...f, tour_name: e.target.value }))
                }
                placeholder="e.g. Alfama Walking Tour"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                Caption{" "}
                <span className="text-gray-300 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Short description for this photo"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              />
            </div>
          </div>

          {uploadError && (
            <p className="text-red-500 text-sm flex items-center gap-1.5">
              <span className="material-icons text-base">error</span>
              {uploadError}
            </p>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl transition disabled:opacity-60 disabled:cursor-not-allowed text-sm shadow-lg shadow-primary/20"
          >
            {uploading ? (
              <>
                <span className="material-icons animate-spin text-base">
                  refresh
                </span>
                Uploading…
              </>
            ) : (
              <>
                <span className="material-icons text-base">upload</span>Upload
                Photo
              </>
            )}
          </button>
        </form>
      </div>

      {/* Image Grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">Loading…</div>
      ) : images.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-icons text-5xl text-gray-200 block mb-3">
            image_not_supported
          </span>
          <p className="text-gray-400">
            No gallery images yet. Upload the first one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-xl overflow-hidden aspect-square bg-gray-100 shadow-sm"
            >
              <img
                src={img.image_url}
                alt={img.description || img.tour_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-200 flex flex-col items-start justify-end p-2 gap-1">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide truncate max-w-full">
                  {img.tour_name}
                </span>
                {img.description && (
                  <p className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] leading-tight line-clamp-2">
                    {img.description}
                  </p>
                )}
              </div>
              {/* Delete Button */}
              <button
                onClick={() => setDeleteTarget(img)}
                className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                title="Delete image"
              >
                <span className="material-icons text-sm">delete</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex flex-col items-center text-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden mb-1">
                <img
                  src={deleteTarget.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-icons text-red-500 text-xl">
                  delete_forever
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Delete Photo?
              </h3>
              <p className="text-sm text-gray-500">
                This will permanently remove the photo from the gallery and
                storage. This cannot be undone.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition disabled:opacity-60 flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <span className="material-icons animate-spin text-base">
                      sync
                    </span>
                    Deleting…
                  </>
                ) : (
                  <>
                    <span className="material-icons text-base">delete</span>
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ReviewsManager = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalReview, setModalReview] = useState(undefined); // undefined=closed, null=add, obj=edit
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setReviews(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const visible = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.country || "").toLowerCase().includes(q) ||
      (r.tour_name || "").toLowerCase().includes(q) ||
      r.review_text.toLowerCase().includes(q)
    );
  });

  const avgRating = reviews.length
    ? (
        reviews.reduce((a, r) => a + Number(r.rating || 0), 0) / reviews.length
      ).toFixed(1)
    : "—";

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            icon: "rate_review",
            label: "Total Reviews",
            value: reviews.length,
            color: "bg-primary/10 text-primary",
          },
          {
            icon: "star",
            label: "Avg Rating",
            value: reviews.length ? avgRating + "★" : "—",
            color: "bg-amber-100 text-amber-600",
          },
          {
            icon: "public",
            label: "Countries",
            value: new Set(reviews.map((r) => r.country).filter(Boolean)).size,
            color: "bg-blue-100 text-blue-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}
            >
              <span className="material-icons text-xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-gray-100">
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, tour, country…"
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-60"
            />
          </div>
          <button
            onClick={() => setModalReview(null)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-sm px-4 py-2 rounded-lg transition shadow-md shadow-primary/20"
          >
            <span className="material-icons text-base">add</span>
            Add Review
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-icons animate-spin text-primary text-3xl">
              sync
            </span>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <span className="material-icons text-4xl">rate_review</span>
            <p className="font-semibold">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {["Guest", "Tour", "Rating", "Review", "Date", "Actions"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/60 transition">
                    {/* Guest */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {r.photo_url ? (
                          <img
                            src={r.photo_url}
                            alt={r.name}
                            className="w-9 h-9 rounded-full object-cover border border-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                            {r.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-900 whitespace-nowrap">
                            {r.name}
                          </p>
                          <p className="text-xs text-gray-400">
                            {r.country || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Tour */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded whitespace-nowrap">
                        {r.tour_name || "—"}
                      </span>
                    </td>
                    {/* Rating */}
                    <td className="px-4 py-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span
                            key={i}
                            className={`material-icons text-base ${i < r.rating ? "text-yellow-400" : "text-gray-200"}`}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </td>
                    {/* Review text */}
                    <td className="px-4 py-3 max-w-xs">
                      <p className="text-gray-600 text-xs italic line-clamp-2">
                        &ldquo;{r.review_text}&rdquo;
                      </p>
                    </td>
                    {/* Date */}
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-400">
                      {r.created_at
                        ? new Date(r.created_at).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setModalReview(r)}
                          className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 hover:text-primary hover:border-primary font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          <span className="material-icons text-xs">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(r)}
                          className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-300 font-semibold px-3 py-1.5 rounded-lg transition"
                        >
                          <span className="material-icons text-xs">delete</span>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modalReview !== undefined && (
        <ReviewModal
          review={modalReview}
          onClose={() => setModalReview(undefined)}
          onSaved={() => {
            setModalReview(undefined);
            fetchReviews();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteReviewConfirm
          review={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            fetchReviews();
          }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Transactions Manager  (Stripe payment history)
───────────────────────────────────────────────────────────── */
const PAYMENT_STATUS_STYLE = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-600",
  refunded: "bg-purple-100 text-purple-600",
};

const PAYMENT_STATUS_ICON = {
  paid: "check_circle",
  pending: "hourglass_top",
  failed: "cancel",
  refunded: "replay",
};

const TransactionsManager = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all"); // all, today, week, month
  const [expanding, setExpanding] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);

    // 1) Fetch from Stripe Sync Engine view (auto-synced Stripe data)
    const { data: stripeData, error: stripeErr } = await supabase
      .from("stripe_transactions")
      .select("*")
      .order("created_at", { ascending: false });

    if (stripeErr) console.error("stripe_transactions error:", stripeErr);

    // 2) Fetch from local payments table (with booking join)
    const { data: localData, error: localErr } = await supabase
      .from("payments")
      .select(`
        *,
        booking:bookings (
          id, tour_id, tour_name, booking_date, booking_time,
          language, adults, youth, infants, seniors, total_guests,
          first_name, last_name, email, phone, special_requests,
          subtotal, service_fee, total_amount, status
        )
      `)
      .order("created_at", { ascending: false });

    if (localErr) console.error("payments error:", localErr);

    // 3) Merge: Use stripe_transactions as primary, enrich with local booking data
    const localBySession = {};
    (localData || []).forEach((p) => {
      if (p.stripe_session_id) localBySession[p.stripe_session_id] = p;
    });

    const merged = [];
    const seenSessions = new Set();

    // First: add all Stripe Sync records (enriched with local booking details)
    (stripeData || []).forEach((st) => {
      seenSessions.add(st.session_id);
      const local = localBySession[st.session_id];

      // Determine unified status
      let status = "pending";
      if (st.charge_refunded) status = "refunded";
      else if (st.payment_status === "paid" || st.charge_paid) status = "paid";
      else if (st.session_status === "expired") status = "failed";

      merged.push({
        id: local?.id || st.session_id,
        stripe_session_id: st.session_id,
        stripe_payment_intent: st.payment_intent_id,
        charge_id: st.charge_id,
        amount: Number(st.amount || 0),
        currency: st.currency || "eur",
        status,
        customer_name: st.customer_name || local?.customer_name || "—",
        customer_email: st.customer_email || st.receipt_email || local?.customer_email || "—",
        tour_name: st.tour_name || local?.tour_name || "—",
        booking_id: st.booking_id || local?.booking_id,
        created_at: st.created_at || local?.created_at,
        receipt_url: local?.receipt_url || null,
        // Booking details from local join
        booking: local?.booking || null,
        _source: "stripe_sync",
      });
    });

    // Second: add any local payments that weren't in the Stripe Sync view
    (localData || []).forEach((p) => {
      if (!p.stripe_session_id || !seenSessions.has(p.stripe_session_id)) {
        merged.push({
          ...p,
          _source: "local",
        });
      }
    });

    setPayments(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Stats
  const totalRevenue = payments
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((s, p) => s + Number(p.amount || 0), 0);

  const counts = {
    all: payments.length,
    paid: payments.filter((p) => p.status === "paid").length,
    pending: payments.filter((p) => p.status === "pending").length,
    failed: payments.filter((p) => p.status === "failed").length,
    refunded: payments.filter((p) => p.status === "refunded").length,
  };

  // Date filter helper
  const isInDateRange = (dateStr) => {
    if (dateRange === "all") return true;
    const d = new Date(dateStr);
    const now = new Date();
    if (dateRange === "today") {
      return d.toDateString() === now.toDateString();
    }
    if (dateRange === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }
    if (dateRange === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return d >= monthAgo;
    }
    return true;
  };

  const visible = payments.filter((p) => {
    const matchTab = filter === "all" || p.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (p.customer_name || "").toLowerCase().includes(q) ||
      (p.customer_email || "").toLowerCase().includes(q) ||
      (p.tour_name || "").toLowerCase().includes(q) ||
      (p.stripe_session_id || "").toLowerCase().includes(q);
    const matchDate = isInDateRange(p.created_at);
    return matchTab && matchSearch && matchDate;
  });

  // Monthly revenue for mini chart (last 6 months)
  const monthlyRevenue = (() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleDateString("en-GB", { month: "short" });
      const rev = payments
        .filter(
          (p) =>
            p.status === "paid" &&
            new Date(p.created_at).getFullYear() === d.getFullYear() &&
            new Date(p.created_at).getMonth() === d.getMonth(),
        )
        .reduce((s, p) => s + Number(p.amount || 0), 0);
      months.push({ key, label, revenue: rev });
    }
    return months;
  })();
  const maxMonthlyRev = Math.max(...monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            icon: "account_balance",
            label: "Total Revenue",
            value: `€${totalRevenue.toFixed(2)}`,
            color: "bg-green-100 text-green-600",
          },
          {
            icon: "receipt_long",
            label: "Transactions",
            value: counts.all,
            color: "bg-primary/10 text-primary",
          },
          {
            icon: "hourglass_top",
            label: "Pending",
            value: `€${totalPending.toFixed(2)}`,
            color: "bg-amber-100 text-amber-600",
          },
          {
            icon: "replay",
            label: "Refunded",
            value: `€${totalRefunded.toFixed(2)}`,
            color: "bg-purple-100 text-purple-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}
            >
              <span className="material-icons text-xl">{s.icon}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400">{s.label}</p>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Revenue Chart */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span className="material-icons text-primary text-base">bar_chart</span>
          Monthly Revenue (Last 6 Months)
        </h3>
        <div className="flex items-end gap-3 h-32">
          {monthlyRevenue.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-gray-500">
                €{m.revenue > 0 ? m.revenue.toFixed(0) : "0"}
              </span>
              <div
                className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden transition-all"
                style={{
                  height: `${Math.max((m.revenue / maxMonthlyRev) * 100, 4)}%`,
                }}
              >
                <div
                  className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                  style={{
                    height: "100%",
                  }}
                />
              </div>
              <span className="text-[10px] font-semibold text-gray-400">
                {m.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 px-4 sm:px-5 pt-4 pb-3 border-b border-gray-100">
          {/* Top row: tabs + date range */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
              {["all", "paid", "pending", "failed", "refunded"].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
                    filter === s
                      ? "bg-primary text-white shadow-sm"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {s} <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {[
                { key: "all", label: "All Time" },
                { key: "today", label: "Today" },
                { key: "week", label: "7 Days" },
                { key: "month", label: "30 Days" },
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setDateRange(r.key)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                    dateRange === r.key
                      ? "bg-gray-800 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          {/* Search */}
          <div className="relative">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, tour, session ID…"
              className="w-full sm:w-72 pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* Loading / empty */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <span className="material-icons animate-spin text-primary text-3xl">sync</span>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
            <span className="material-icons text-4xl">receipt_long</span>
            <p className="font-semibold">No transactions found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {["Customer", "Tour", "Amount", "Status", "Date", "Session", "Actions"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {visible.map((p) => (
                    <>
                      <tr key={p.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-gray-900">
                            {p.customer_name || "—"}
                          </p>
                          <p className="text-xs text-gray-400">
                            {p.customer_email || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded">
                            {p.tour_name || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-bold text-gray-900">
                            €{Number(p.amount || 0).toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-400 uppercase">
                            {p.currency || "eur"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${PAYMENT_STATUS_STYLE[p.status] || "bg-gray-100 text-gray-600"}`}
                          >
                            <span className="material-icons text-[11px]">
                              {PAYMENT_STATUS_ICON[p.status] || "help"}
                            </span>
                            {p.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-semibold text-gray-800">
                            {new Date(p.created_at).toLocaleDateString("en-GB")}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(p.created_at).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="text-xs text-gray-400 font-mono truncate max-w-[120px]" title={p.stripe_session_id}>
                            {p.stripe_session_id
                              ? `…${p.stripe_session_id.slice(-12)}`
                              : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              setExpanding(expanding === p.id ? null : p.id)
                            }
                            className="flex items-center gap-1 text-xs border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold px-3 py-1.5 rounded-lg transition"
                          >
                            <span className="material-icons text-xs">
                              {expanding === p.id ? "expand_less" : "expand_more"}
                            </span>
                            Details
                          </button>
                        </td>
                      </tr>
                      {expanding === p.id && (
                        <tr key={`exp-${p.id}`} className="bg-gray-50/80">
                          <td colSpan={7} className="px-6 py-4">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              {[
                                { label: "Payment ID", value: typeof p.id === "number" ? `#${p.id}` : `${(p.id || "").slice(0, 16)}…` },
                                { label: "Booking ID", value: p.booking_id ? `#${p.booking_id.slice(0, 8)}…` : "—" },
                                {
                                  label: "Booking Date",
                                  value: p.booking?.booking_date
                                    ? new Date(p.booking.booking_date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
                                    : "—",
                                },
                                {
                                  label: "Booking Time",
                                  value: p.booking?.booking_time || "—",
                                },
                                {
                                  label: "Guests",
                                  value: p.booking
                                    ? `${p.booking.adults || 0}A · ${p.booking.youth || 0}Y · ${p.booking.seniors || 0}S · ${p.booking.infants || 0}I (${p.booking.total_guests || 0} total)`
                                    : "—",
                                },
                                {
                                  label: "Language",
                                  value: p.booking?.language || "—",
                                },
                                {
                                  label: "Phone",
                                  value: p.booking?.phone || "—",
                                },
                                {
                                  label: "Special Requests",
                                  value: p.booking?.special_requests || "None",
                                },
                                {
                                  label: "Stripe Session",
                                  value: p.stripe_session_id || "—",
                                },
                                {
                                  label: "Payment Intent",
                                  value: p.stripe_payment_intent || "—",
                                },
                                {
                                  label: "Charge ID",
                                  value: p.charge_id || "—",
                                },
                                {
                                  label: "Created",
                                  value: new Date(p.created_at).toLocaleString("en-GB"),
                                },
                                {
                                  label: "Data Source",
                                  value: p._source === "stripe_sync" ? "Stripe Sync" : "Local",
                                },
                                {
                                  label: "Receipt",
                                  value: p.receipt_url ? "View" : "N/A",
                                },
                              ].map(({ label, value }) => (
                                <div key={label}>
                                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {label}
                                  </p>
                                  {label === "Receipt" && p.receipt_url ? (
                                    <a
                                      href={p.receipt_url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-primary font-semibold mt-0.5 underline"
                                    >
                                      View Receipt
                                    </a>
                                  ) : (
                                    <p className="text-gray-800 font-semibold mt-0.5 truncate">
                                      {value}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden divide-y divide-gray-100">
              {visible.map((p) => (
                <div key={p.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {p.customer_name || "—"}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {p.customer_email || "—"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-gray-900">
                        €{Number(p.amount || 0).toFixed(2)}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold capitalize ${PAYMENT_STATUS_STYLE[p.status] || "bg-gray-100 text-gray-600"}`}
                      >
                        <span className="material-icons text-[10px]">
                          {PAYMENT_STATUS_ICON[p.status] || "help"}
                        </span>
                        {p.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-1 rounded">
                      {p.tour_name || "—"}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {new Date(p.created_at).toLocaleDateString("en-GB")}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setExpanding(expanding === p.id ? null : p.id)
                    }
                    className="flex items-center gap-1 text-xs border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold px-3 py-2 rounded-lg transition"
                  >
                    <span className="material-icons text-xs">
                      {expanding === p.id ? "expand_less" : "expand_more"}
                    </span>
                    Details
                  </button>
                  {expanding === p.id && (
                    <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-2 gap-3 text-xs">
                      {[
                        { label: "Payment ID", value: `#${p.id}` },
                        { label: "Booking ID", value: p.booking_id ? `#${p.booking_id}` : "—" },
                        { label: "Session", value: p.stripe_session_id ? `…${p.stripe_session_id.slice(-12)}` : "—" },
                        { label: "Created", value: new Date(p.created_at).toLocaleDateString("en-GB") },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="font-bold text-gray-400 uppercase tracking-wider text-[10px]">
                            {label}
                          </p>
                          <p className="text-gray-800 font-semibold mt-0.5">
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Main Dashboard
───────────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState("bookings");
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalTour, setModalTour] = useState(undefined); // undefined = closed, null = add new, obj = edit
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState("");

  // Check if already authenticated on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.app_metadata?.role === "admin") {
        setUnlocked(true);
      }
      setCheckingAuth(false);
    });
    // Listen for auth state changes (e.g., session expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) setUnlocked(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUnlocked(false);
  };

  const fetchTours = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tours")
      .select(
        "id,name,subtitle,category,badge,badge_color,duration,people,guide_language,meeting_point,highlights,gallery,details,activity,journey,rating,review_count,price,title_image,created_at",
      )
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    else setTours(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (unlocked) fetchTours();
  }, [unlocked]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center">
        <span className="material-icons animate-spin text-primary text-4xl">sync</span>
      </div>
    );
  }

  if (!unlocked) return <LoginGate onUnlock={() => setUnlocked(true)} />;

  const filtered = tours.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      (t.category || "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 font-display">
      {/* ── Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="material-icons text-primary text-xl">
                admin_panel_settings
              </span>
            </div>
            <div>
              <p className="font-extrabold text-gray-900 leading-none text-sm">
                Admin Dashboard
              </p>
              <p className="text-gray-400 text-xs">Tuk-in-Lisbon</p>
            </div>

            {/* Tab switcher */}
            <div className="hidden sm:flex ml-6 gap-1 bg-gray-100 rounded-xl p-1">
              {[
                {
                  key: "bookings",
                  icon: "confirmation_number",
                  label: "Bookings",
                },
                {
                  key: "transactions",
                  icon: "receipt_long",
                  label: "Transactions",
                },
                { key: "tours", icon: "map", label: "Tours" },
                { key: "reviews", icon: "rate_review", label: "Reviews" },
                { key: "gallery", icon: "photo_library", label: "Gallery" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    activeTab === t.key
                      ? "bg-white text-primary shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <span className="material-icons text-sm">{t.icon}</span>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search — Tours tab, desktop only */}
            {activeTab === "tours" && (
              <div className="relative hidden md:block">
                <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search tours…"
                  className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary w-48"
                />
              </div>
            )}
            {/* Add Tour — visible on all sizes */}
            {activeTab === "tours" && (
              <button
                onClick={() => setModalTour(null)}
                className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm px-3 sm:px-4 py-2 rounded-lg transition shadow-md shadow-primary/20"
              >
                <span className="material-icons text-base">add</span>
                <span className="hidden sm:inline">Add Tour</span>
              </button>
            )}
            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Log out"
              className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-200 transition"
            >
              <span className="material-icons text-base">logout</span>
            </button>
          </div>
        </div>
      </header>
      {/* ── Mobile tab switcher */}
      <div className="sm:hidden flex gap-1 bg-white border-b border-gray-200 px-2 py-2 overflow-x-auto scrollbar-none">
        {[
          { key: "bookings", icon: "confirmation_number", label: "Bookings" },
          { key: "transactions", icon: "receipt_long", label: "Transactions" },
          { key: "tours", icon: "map", label: "Tours" },
          { key: "reviews", icon: "rate_review", label: "Reviews" },
          { key: "gallery", icon: "photo_library", label: "Gallery" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-1.5 flex-shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === t.key
                ? "bg-primary/10 text-primary"
                : "text-gray-500"
            }`}
          >
            <span className="material-icons text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>
      {/* ── Bookings Tab */}
      {activeTab === "bookings" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BookingsManager />
        </div>
      )}
      {/* ── Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <TransactionsManager />
        </div>
      )}
      {/* ── Tours Tab */}
      {activeTab === "tours" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: "map",
                label: "Total Tours",
                value: tours.length,
                color: "bg-primary/10 text-primary",
              },
              {
                icon: "star",
                label: "Avg Rating",
                value: tours.length
                  ? (
                      tours.reduce((a, t) => a + Number(t.rating || 0), 0) /
                      tours.length
                    ).toFixed(1) + "★"
                  : "—",
                color: "bg-amber-100 text-amber-600",
              },
              {
                icon: "payments",
                label: "Lowest Price",
                value: tours.length
                  ? "€" +
                    Math.min(
                      ...tours
                        .filter((t) => t.price)
                        .map((t) => Number(t.price)),
                    )
                  : "—",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: "schedule",
                label: "Avg Duration",
                value: tours.length
                  ? (
                      tours.reduce((a, t) => a + Number(t.duration || 0), 0) /
                      tours.length
                    ).toFixed(1) + "h"
                  : "—",
                color: "bg-blue-100 text-blue-600",
              },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}
                >
                  <span className="material-icons text-xl">{s.icon}</span>
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-gray-900 leading-none">
                    {s.value}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile search */}
          <div className="relative mb-4 sm:hidden">
            <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tours…"
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Table */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <span className="material-icons text-5xl text-gray-300 animate-spin block mb-3">
                sync
              </span>
              <p className="text-gray-400">Loading tours…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
              <span className="material-icons text-5xl text-gray-300 block mb-3">
                search_off
              </span>
              <p className="text-gray-400">No tours found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Tour
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Rating
                      </th>
                      <th className="text-right px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((tour) => (
                      <tr
                        key={tour.id}
                        className="hover:bg-gray-50/60 transition"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={tour.title_image}
                              alt={tour.name}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/48";
                              }}
                            />
                            <div>
                              <p className="font-bold text-gray-900">
                                {tour.name}
                              </p>
                              {tour.subtitle && (
                                <p className="text-xs text-gray-400">
                                  {tour.subtitle}
                                </p>
                              )}
                              {tour.badge && (
                                <span
                                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 ${badgeStyle[tour.badge_color] || badgeStyle.primary}`}
                                >
                                  {tour.badge}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {tour.category}
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {tour.duration}h
                        </td>
                        <td className="px-5 py-4 text-gray-600">
                          {tour.price ? `€${tour.price}` : "—"}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1 text-amber-500 font-bold">
                            <span className="material-icons text-sm">star</span>
                            {Number(tour.rating).toFixed(1)}
                            <span className="text-gray-400 font-normal text-xs">
                              ({tour.review_count})
                            </span>
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setModalTour(tour)}
                              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:text-primary hover:border-primary font-semibold text-xs px-3 py-2 rounded-lg transition"
                            >
                              <span className="material-icons text-sm">
                                edit
                              </span>
                              Edit
                            </button>
                            <button
                              onClick={() => setDeleteTarget(tour)}
                              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-300 font-semibold text-xs px-3 py-2 rounded-lg transition"
                            >
                              <span className="material-icons text-sm">
                                delete
                              </span>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden divide-y divide-gray-100">
                {filtered.map((tour) => (
                  <div key={tour.id} className="p-4 flex gap-4 items-start">
                    <img
                      src={tour.title_image}
                      alt={tour.name}
                      className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/64";
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {tour.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {tour.category} · {tour.duration}h ·{" "}
                        {tour.price ? `€${tour.price}` : "Free"}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setModalTour(tour)}
                          className="flex items-center gap-1 text-xs border border-gray-200 hover:border-primary hover:text-primary text-gray-600 px-2.5 py-1.5 rounded-lg font-semibold transition"
                        >
                          <span className="material-icons text-xs">edit</span>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(tour)}
                          className="flex items-center gap-1 text-xs border border-gray-200 hover:border-red-300 hover:text-red-500 text-gray-600 px-2.5 py-1.5 rounded-lg font-semibold transition"
                        >
                          <span className="material-icons text-xs">delete</span>
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-center text-xs text-gray-300 mt-8">
            Entertainment Mama · Admin Dashboard · {filtered.length} tour
            {filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}{" "}
      {/* ── end Tours Tab */}
      {/* ── Reviews Tab */}
      {activeTab === "reviews" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ReviewsManager />
        </div>
      )}
      {/* ── Gallery Tab */}
      {activeTab === "gallery" && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <GalleryManager />
        </div>
      )}
      {/* ── Modals */}
      {modalTour !== undefined && (
        <TourModal
          tour={modalTour}
          onClose={() => setModalTour(undefined)}
          onSaved={() => {
            setModalTour(undefined);
            fetchTours();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          tour={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            fetchTours();
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
