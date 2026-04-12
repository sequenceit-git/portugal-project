import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { MEETING_POINTS } from "../../components/MeetingPoints";

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
      .select("*, tours(duration)")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    else setBookings(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  
  const deleteBooking = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this booking? This action cannot be undone.")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    } else {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };



  const setStatus = async (id, status) => {
    setLoading(true);
    // If setting to confirmed, use the edge function to also send emails
    if (status === "confirmed") {
      const { data, error } = await supabase.functions.invoke("admin-confirm-booking", {
        body: { bookingId: id }
      });
      if (error) {
        alert("Confirmation failed: " + error.message);
        setLoading(false);
        return;
      }
    } else if (status === "cancelled") {
      const reason = window.prompt("Please provide a reason for cancelling this booking:");
      if (!reason || reason.trim() === "") {
        setLoading(false);
        return; // Admin clicked cancel or left empty
      }
      const { data, error } = await supabase.functions.invoke("cancel-booking", {
        body: { bookingId: id, reason, isAdmin: true }
      });
      
      if (error) {
        alert("Cancellation failed: " + error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", id);
      if (error) {
        alert("Update failed: " + error.message);
        setLoading(false);
        return;
      }
    }
    
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b)),
    );
    setLoading(false);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-900">Manage Bookings</h2>
      </div>

      {/* Automation info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3 mb-2">
        <span className="material-icons text-blue-500 mt-0.5 shrink-0">smart_toy</span>
        <div className="text-sm text-blue-800">
          <p className="font-bold mb-1">Fully Automated System</p>
          <p className="text-blue-700 leading-relaxed">
            Bookings are <strong>automatically confirmed</strong> when payment is completed via Stripe.
            Pending bookings that remain unpaid for <strong>30 minutes</strong> are automatically cancelled.
            Customers can cancel for a full refund up to <strong>24 hours</strong> before the tour start time.
          </p>
        </div>
      </div>
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
                      "Contact",
                      "Tour & Date",
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
                      <tr className="hover:bg-gray-50/60 transition group">
                        <td className="px-4 py-4 align-top">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                              {b.first_name?.[0]}{b.last_name?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">
                                {b.first_name} {b.last_name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">ID: #{b.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <a href={`mailto:${b.email}`} className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary transition group/link">
                              <span className="material-icons text-[14px] text-gray-400 group-hover/link:text-primary">email</span>
                              <span className="truncate max-w-[150px]" title={b.email}>{b.email}</span>
                            </a>
                            {b.phone && (
                              <a href={`tel:${b.phone}`} className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-primary transition group/link">
                                <span className="material-icons text-[14px] text-gray-400 group-hover/link:text-primary">phone</span>
                                <span>{b.phone}</span>
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-bold text-gray-800 text-sm line-clamp-2 max-w-[250px]" title={b.tour_name}>
                            {b.tour_name || "—"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
                            <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                              <span className="material-icons text-[12px]">event</span>
                              {b.booking_date}
                            </span>
                            <span className="inline-flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md">
                              <span className="material-icons text-[12px]">schedule</span>
                              {b.booking_time}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top text-sm">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="bg-gray-100 text-gray-700 font-bold text-xs px-2.5 py-1 rounded-md flex items-center gap-1.5">
                              <span className="material-icons text-[14px]">groups</span>
                              {b.total_guests} Traveler{b.total_guests > 1 ? "s" : ""}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top whitespace-nowrap">
                          <p className="font-black text-gray-900 text-base tracking-tight">
                            €{Number(b.total_amount || 0).toFixed(2)}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <span className="material-icons text-[12px]">payments</span>
                            <span className="uppercase tracking-wide font-semibold">{b.payment_method}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
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
                        <td className="px-4 py-4 align-top">
                          <div className="flex flex-col gap-1.5 w-[110px]">

                            {b.status !== "cancelled" && (
                              <button
                                onClick={() => setStatus(b.id, "cancelled")}
                                className="flex items-center justify-center gap-1.5 text-xs bg-white border border-red-200 text-red-500 hover:bg-red-50 font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                              >
                                <span className="material-icons text-[14px]">close</span>
                                Cancel
                              </button>
                            )}
                            <button
                              onClick={() =>
                                setExpanding(expanding === b.id ? null : b.id)
                              }
                              className="flex items-center justify-center gap-1.5 text-xs bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-primary hover:border-primary/40 font-bold px-3 py-1.5 rounded-lg transition shadow-sm"
                            >
                              <span className="material-icons text-[16px] text-gray-400">
                                {expanding === b.id ? "expand_less" : "expand_more"}
                              </span>
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expanding === b.id && (
                        <tr key={`exp-${b.id}`} className="bg-gray-50/60 border-b-2 border-gray-200/50">
                          <td colSpan={7} className="px-0 py-0">
                            <div className="mx-4 my-3 bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none">
                                <span className="material-icons text-[120px]">explore</span>
                              </div>
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <span className="material-icons text-primary bg-primary/10 p-1.5 rounded-lg text-[18px]">receipt_long</span>
                                  <h4 className="font-extrabold text-gray-900">Booking Details</h4>
                                </div>
                                <button
                                  onClick={() => deleteBooking(b.id)}
                                  title="Delete Booking forever"
                                  className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 hover:underline font-bold transition"
                                >
                                  <span className="material-icons text-[14px]">delete</span>
                                  Delete Booking
                                </button>
                              </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 gap-y-6 text-sm relative z-10 w-full lg:w-[85%] xl:w-[75%]">
                              {[
                                {
                                  label: "Booking ID",
                                  value: `#${b.id}`,
                                  col: "1"
                                },
                                {
                                  label: "Booked On",
                                  value: new Date(b.created_at).toLocaleString("en-GB"),
                                  col: "1"
                                },
                                {
                                  label: "Total Guests",
                                  value: `${b.total_guests} Traveler${b.total_guests > 1 ? "s" : ""}`,
                                  col: "1"
                                },
                                {
                                  label: "Language",
                                  value: b.language || "N/A",
                                  col: "1"
                                },
                                {
                                  label: "Subtotal",
                                  value: `€${Number(b.subtotal || 0).toFixed(2)}`,
                                  col: "1"
                                },
                                {
                                  label: "Service Fee",
                                  value: `€${Number(b.service_fee || 0).toFixed(2)}`,
                                  col: "1"
                                },
                                {
                                  label: "Duration",
                                  value: b.tours?.duration ? `${b.tours?.duration} hours` : "N/A",
                                  col: "1"
                                },
                                {
                                  label: "Meeting Point",
                                  value: (
                                    <div className="flex flex-col gap-1 w-full max-w-[280px]">
                                      <span className="font-semibold text-gray-800 break-words">{b.meeting_point || "Not selected"}</span>
                                      {b.meeting_point && MEETING_POINTS.find(m => m.name === b.meeting_point) && (
                                        <div className="flex flex-col gap-1.5 mt-1 border-t border-gray-100 pt-1.5">
                                          <a href={MEETING_POINTS.find(m => m.name === b.meeting_point)?.url} target="_blank" rel="noreferrer" className="bg-primary/5 hover:bg-primary/10 text-primary font-bold text-xs py-1.5 px-3 rounded-lg flex items-center gap-1.5 w-max transition">
                                            <span className="material-icons text-[14px]">location_on</span>
                                            Open Map
                                          </a>
                                          <span className="text-gray-500 text-[11px] leading-snug">{MEETING_POINTS.find(m => m.name === b.meeting_point)?.note}</span>
                                        </div>
                                      )}
                                    </div>
                                  ),
                                  col: "2" // takes up more space for description
                                },
                              ].map(({ label, value, col }) => (
                                <div key={label} className={col === "2" ? "md:col-span-2" : ""}>
                                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gray-200 inline-block"></span>
                                    {label}
                                  </p>
                                  <div className="text-gray-800 font-medium pl-2.5 border-l border-gray-100 min-h-[22px]">
                                    {value}
                                  </div>
                                </div>
                              ))}
                              {b.special_requests && (
                                <div className="col-span-2 md:col-span-4 bg-amber-50/50 border border-amber-100 p-4 rounded-xl mt-2">
                                  <p className="text-[11px] font-extrabold text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <span className="material-icons text-[14px]">speaker_notes</span>
                                    Guest Notes & Special Requests
                                  </p>
                                  <p className="text-gray-800 font-medium leading-relaxed">
                                    {b.special_requests}
                                  </p>
                                </div>
                              )}
                              {b.cancellation_reason && (
                                <div className="col-span-2 md:col-span-4 bg-red-50/80 border border-red-100 p-4 rounded-xl mt-2">
                                  <p className="text-[11px] font-extrabold text-red-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                    <span className="material-icons text-[14px]">warning</span>
                                    Cancellation Reason
                                  </p>
                                  <p className="text-red-900 font-semibold leading-relaxed">
                                    {b.cancellation_reason}
                                  </p>
                                </div>
                              )}
                            </div>
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
                        {b.total_guests} traveler{b.total_guests > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                  {/* Row 3: actions */}
                  <div className="flex gap-2 flex-wrap">

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
                    <button
                      onClick={() => deleteBooking(b.id)}
                      title="Delete Booking forever"
                      className="flex items-center gap-1 text-xs border border-red-200 text-red-500 hover:bg-red-50 font-bold px-3 py-2 rounded-lg transition"
                    >
                      <span className="material-icons text-xs">delete</span>
                      Delete
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
                  { label: "Duration", value: b.tours?.duration || "N/A" },
                  {
                    label: "Meeting Point",
                    value: (
                      <div className="flex flex-col gap-1">
                        <span>{b.meeting_point || "Not selected"}</span>
                        {b.meeting_point && MEETING_POINTS.find(m => m.name === b.meeting_point) && (
                          <div className="mt-1 flex flex-col gap-0.5">
                            <a href={MEETING_POINTS.find(m => m.name === b.meeting_point)?.url} target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-600 hover:underline text-xs flex items-center gap-1 w-max">
                              <span className="material-icons text-[14px]">map</span>
                              View on Map
                            </a>
                            <span className="text-gray-500 text-xs italic mt-1 leading-tight">{MEETING_POINTS.find(m => m.name === b.meeting_point)?.note}</span>
                          </div>
                        )}
                      </div>
                    )
                  },
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
