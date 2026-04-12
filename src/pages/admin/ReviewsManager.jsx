import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

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
export default ReviewsManager;
