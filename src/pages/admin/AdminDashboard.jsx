import React, { useState, useEffect, useRef } from "react";

import { supabase } from "../../lib/supabaseClient";
import LoginGate from "./LoginGate";
import TourModal from "./TourModal";
import DeleteConfirm from "./DeleteConfirm";
import BookingsManager from "./BookingsManager";
import ReviewsManager from "./ReviewsManager";
import GalleryManager from "./GalleryManager";
import TransactionsManager from "./TransactionsManager";

/* ─────────────────────────────────────────────────────────────
   Badge chip helper
───────────────────────────────────────────────────────────── */
const badgeStyle = {
  amber: "bg-amber-100 text-amber-700",
  primary: "bg-primary/10 text-primary",
  dark: "bg-gray-100 text-gray-700",
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
        "id,name,subtitle,category,badge,badge_color,duration,people,guide_language,meeting_point,highlights,gallery,details,activity,journey,rating,review_count,price_1_person,price_2_person,price_3_person,price_4_person,price_5_person,price_6_person,title_image,created_at",
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
        <span className="material-icons animate-spin text-primary text-4xl">
          sync
        </span>
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
            {/* Home */}
            <a
              href="/"
              title="Go to main site"
              className="w-9 h-9 border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/40 transition"
            >
              <span className="material-icons text-base">home</span>
            </a>
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
                  ? "$" +
                    Math.min(
                      ...tours
                        .filter((t) => t.price_1_person)
                        .map((t) => Number(t.price_1_person)),
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
                        Price Range
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
                          {tour.price_1_person
                            ? `$${tour.price_1_person}–${tour.price_6_person}`
                            : "—"}
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
                        {tour.price_1_person
                          ? `$${tour.price_1_person}–${tour.price_6_person}`
                          : "Free"}
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
