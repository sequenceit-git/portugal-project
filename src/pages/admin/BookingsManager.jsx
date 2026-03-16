import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

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
            value: `$${totalRevenue.toFixed(2)}`,
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
                    <React.Fragment key={b.id}>
                      <tr className="hover:bg-gray-50/60 transition">
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
                            ${Number(b.total_amount || 0).toFixed(2)}
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
                                  value: `$${Number(b.subtotal || 0).toFixed(2)}`,
                                },
                                {
                                  label: "Service Fee",
                                  value: `$${Number(b.service_fee || 0).toFixed(2)}`,
                                },
                                {
                                  label: "Meeting Point",
                                  value: b.meeting_point || "Not selected",
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
                    </React.Fragment>
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
                        ${Number(b.total_amount || 0).toFixed(2)}
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
                          value: `$${Number(b.subtotal || 0).toFixed(2)}`,
                        },
                        {
                          label: "Service Fee",
                          value: `$${Number(b.service_fee || 0).toFixed(2)}`,
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
export default BookingsManager;
