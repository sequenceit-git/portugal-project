import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

/* ── helpers ─────────────────────────────────────────────── */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Generate time slots every 15 min from 8:15 AM to 4:55 PM
const TIME_SLOTS = (() => {
  const slots = [];
  let totalMin = 8 * 60 + 15; // 8:15 AM
  const endMin = 16 * 60 + 45; // last regular 15-min step before 4:55 PM
  while (totalMin <= endMin) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    const ampm = h < 12 ? "AM" : "PM";
    const hDisp = h > 12 ? h - 12 : h === 0 ? 12 : h;
    slots.push(`${hDisp}:${String(m).padStart(2, "0")} ${ampm}`);
    totalMin += 15;
  }
  slots.push("4:55 PM"); // explicit last slot
  return slots;
})();

// Supported guide languages
const ALL_LANGUAGES = [
  "English",
  "Albanian",
  "Arabic",
  "Armenian",
  "Azerbaijani",
  "Bulgarian",
  "Chinese",
  "Croatian",
  "Czech",
  "Danish",
];

// Build full calendar grid for a given year/month
const buildCalendar = (year, month) => {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const grid = [];
  for (let i = 0; i < firstDay; i++) grid.push(null);
  for (let d = 1; d <= daysInMonth; d++) grid.push(d);
  return grid;
};

const toDateStr = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

/* ── Tour-Specific Per-Person Pricing ──────────────────────── */
// Each tour has 6 pricing tiers based on group size
// For 6+ people, always use price_6_person as the per-person rate
const getTourPerPersonRate = (tour, travelerCount) => {
  if (!tour) return 0;

  const count = Math.max(1, travelerCount);

  if (count === 1) return Number(tour.price_1_person) || 0;
  if (count === 2) return Number(tour.price_2_person) || 0;
  if (count === 3) return Number(tour.price_3_person) || 0;
  if (count === 4) return Number(tour.price_4_person) || 0;
  if (count === 5) return Number(tour.price_5_person) || 0;

  // For 6 or more, use price_6_person rate
  return Number(tour.price_6_person) || 0;
};

// EUR/USD conversion rate (approximate)
const EUR_USD_RATE = 0.92;

/* ── Meeting Points ──────────────────────────────────────── */
const MEETING_POINTS = [
  {
    id: 1,
    name: "Vinhos de Lisboa Wine Shop",
    note: "Please stay next to Vinhos de Lisboa wine shop. Our tour guide will contact you 5–10 min before the tour start.",
    url: "https://maps.app.goo.gl/zLty5GXPme8Lk5Gn7?g_st=awb",
    icon: "wine_bar",
  },
  {
    id: 2,
    name: "Fado Museum",
    note: "Please stay in front of Fado Museum.",
    url: "https://maps.app.goo.gl/Z5KGaJVLcYYdvqDm9?g_st=awb",
    icon: "museum",
  },
  {
    id: 3,
    name: "Train Station",
    note: "Stay in front of the train station.",
    url: "https://maps.app.goo.gl/jxk9ztDvuZBMwRVdA?g_st=awb",
    icon: "train",
  },
];

/* ── Skeleton ────────────────────────────────────────────── */
const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-48 bg-gray-200 rounded-2xl" />
    <div className="h-5 bg-gray-200 rounded w-2/3" />
    <div className="h-4 bg-gray-200 rounded w-1/2" />
  </div>
);

/* ── Main Component ──────────────────────────────────────── */
const Booking = () => {
  const [searchParams] = useSearchParams();
  const tourId = searchParams.get("tourId");

  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

  // Currency toggle: "USD" or "EUR"
  const [currency, setCurrency] = useState("USD");

  // Step selections
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDate, setSelDate] = useState(null); // "YYYY-MM-DD"
  const [selTime, setSelTime] = useState(TIME_SLOTS[0]);
  const [travelerCount, setTravelerCount] = useState(1);
  const [dateOpen, setDateOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState(["English"]);
  const toggleLanguage = (lang) =>
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang],
    );

  // Meeting point selection
  const [meetingPointId, setMeetingPointId] = useState(MEETING_POINTS[0].id);

  // Payment mode: "pay_now" or "reserve"
  const [paymentMode, setPaymentMode] = useState("pay_now");

  // Step 2 – contact
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    specialReq: "",
  });
  const setField = (f) => (e) =>
    setForm((p) => ({ ...p, [f]: e.target.value }));

  // Step 3 – payment
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const lastSubmitRef = useRef(0); // throttle: min 5s between submissions

  /* fetch tour */
  useEffect(() => {
    const load = async () => {
      if (!tourId) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from("tours")
        .select(
          "id,name,subtitle,category,title_image,duration,people,guide_language,meeting_point,highlights,rating,review_count,price_1_person,price_2_person,price_3_person,price_4_person,price_5_person,price_6_person,details,activity",
        )
        .eq("id", tourId)
        .single();
      if (!error && data) {
        setTour(data);
        setTravelerCount(1);
        setSelectedLanguages(["English"]);
      }
      setLoading(false);
    };
    load();
  }, [tourId]);

  // Tour-specific per-person pricing based on traveler count
  const perPersonRate = getTourPerPersonRate(tour, travelerCount);
  const totalGuests = travelerCount;
  const subtotal = travelerCount * perPersonRate;
  const total = subtotal; // no service fee

  // Currency display helpers
  const sym = currency === "EUR" ? "€" : "$";
  const toDisplay = (usd) =>
    currency === "EUR" ? (usd * EUR_USD_RATE).toFixed(2) : usd.toFixed(2);

  // Cancellation date/time helper
  const getCancelDeadline = () => {
    if (!selDate || !selTime) return null;
    // Parse selected time
    const match = selTime.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
    if (!match) return null;
    let h = parseInt(match[1]);
    const m = parseInt(match[2]);
    const ampm = match[3].toUpperCase();
    if (ampm === "PM" && h !== 12) h += 12;
    if (ampm === "AM" && h === 12) h = 0;
    const dt = new Date(selDate + "T00:00:00");
    dt.setHours(h, m, 0, 0);
    dt.setHours(dt.getHours() - 24);
    return dt;
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalYear((y) => y - 1);
      setCalMonth(11);
    } else setCalMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (calMonth === 11) {
      setCalYear((y) => y + 1);
      setCalMonth(0);
    } else setCalMonth((m) => m + 1);
  };

  const isPast = (d) => {
    const sel = new Date(calYear, calMonth, d);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return sel < now;
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!selDate || !selTime || !form.firstName || !form.email) return;

    // Throttle: reject if less than 5 seconds since last submit
    const now = Date.now();
    if (now - lastSubmitRef.current < 5000) {
      alert("Please wait a moment before trying again.");
      return;
    }
    lastSubmitRef.current = now;

    setSubmitting(true);
    try {
      // 1. Save booking to Supabase (pending or reserved)
      const bookingStatus = paymentMode === "reserve" ? "reserved" : "pending";
      const paymentStatus = paymentMode === "reserve" ? "reserved" : "unpaid";

      const { data: bookingData, error } = await supabase
        .from("bookings")
        .insert({
          tour_id: tourId ? Number(tourId) : null,
          tour_name: tour?.name ?? null,
          booking_date: selDate,
          booking_time: selTime,
          language: selectedLanguages.join(", "),
          adults: travelerCount,
          youth: 0,
          infants: 0,
          seniors: 0,
          total_guests: travelerCount,
          first_name: form.firstName,
          last_name: form.lastName || null,
          email: form.email,
          phone: form.phone || null,
          special_requests: form.specialReq || null,
          meeting_point: (
            MEETING_POINTS.find((m) => m.id === meetingPointId) ||
            MEETING_POINTS[0]
          ).name,
          payment_method: paymentMode === "reserve" ? "pay_later" : "stripe",
          subtotal: parseFloat(subtotal.toFixed(2)),
          service_fee: 0,
          total_amount: parseFloat(total.toFixed(2)),
          per_person_rate: perPersonRate,
          status: bookingStatus,
          payment_status: paymentStatus,
        })
        .select("id")
        .single();

      if (error) {
        // Handle duplicate booking (unique index violation)
        if (error.code === "23505") {
          alert(
            "You already have an active booking for this tour at this date and time. Please check your email for the existing booking details.",
          );
          setSubmitting(false);
          return;
        }
        throw error;
      }

      // Reserve now & pay later — show confirmation without payment
      if (paymentMode === "reserve") {
        setSubmitted(true);
        setSubmitting(false);
        return;
      }

      // 2. Create Stripe Checkout Session via Supabase Edge Function
      const { data: fnData, error: fnError } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            bookingId: bookingData.id,
            tourName: tour?.name || "Tour Booking",
            totalAmount: parseFloat(total.toFixed(2)),
            perPersonRate: perPersonRate,
            customerEmail: form.email,
            customerName: `${form.firstName} ${form.lastName || ""}`.trim(),
            passengers: totalGuests,
            bookingDate: selDate,
            bookingTime: selTime,
          },
        },
      );

      if (fnError) throw fnError;
      if (!fnData?.url) throw new Error("Could not create checkout session");

      // 3. Redirect to Stripe Checkout
      window.location.href = fnData.url;
    } catch (err) {
      console.error("Booking/payment failed:", err);
      alert("Could not process payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Success screen ─── */
  if (submitted)
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-4 text-center gap-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <span className="material-icons text-green-500 text-4xl">
            {paymentMode === "reserve" ? "event_available" : "check_circle"}
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          {paymentMode === "reserve"
            ? "Reservation Confirmed!"
            : "Booking Confirmed!"}
        </h1>
        <p className="text-gray-500 max-w-md">
          Thank you, <strong>{form.firstName}</strong>! Your{" "}
          {paymentMode === "reserve" ? "reservation" : "booking"} for{" "}
          <strong>{tour?.name}</strong> on{" "}
          <strong>
            {selDate &&
              new Date(selDate + "T00:00:00").toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
          </strong>{" "}
          at <strong>{selTime}</strong> has been saved.{" "}
          {totalGuests > 0 && (
            <>
              <strong>
                {totalGuests} guest{totalGuests > 1 ? "s" : ""}
              </strong>{" "}
              ·{" "}
            </>
          )}
          Confirmation sent to <strong>{form.email}</strong>.
          {paymentMode === "reserve" && (
            <span className="block mt-2 text-sm text-amber-600">
              💡 Your spot is reserved — no payment needed today. You can pay
              closer to the tour date. Free cancellation up to 24 hours before
              the tour.
            </span>
          )}
        </p>
        <Link
          to="/tours"
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition"
        >
          Browse More Tours
        </Link>
      </div>
    );

  /* ── No tour found ─── */
  if (!loading && !tour)
    return (
      <div className="min-h-screen bg-background-light flex flex-col items-center justify-center px-4 text-center gap-6">
        <span className="material-icons text-5xl text-gray-300">
          search_off
        </span>
        <h1 className="text-2xl font-bold text-gray-900">Tour not found</h1>
        <Link
          to="/tours"
          className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition"
        >
          View All Tours
        </Link>
      </div>
    );

  const grid = buildCalendar(calYear, calMonth);

  return (
    <div className="bg-background-light min-h-screen font-display antialiased">
      <SEO
        title={tour ? `Book ${tour.name}` : "Book a Tour"}
        description={
          tour
            ? `Reserve your spot on the ${tour.name} with Tukinlisbon. Secure online booking — instant confirmation.`
            : "Book a private guided tour in Lisbon with Tukinlisbon."
        }
        canonical="/booking"
        noIndex={true}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-400 mb-5 sm:mb-8">
          <Link to="/tours" className="hover:text-primary transition">
            Tours
          </Link>
          <span className="material-icons text-sm">chevron_right</span>
          {tour && (
            <Link
              to={`/tour-details/${tour.id}`}
              className="hover:text-primary transition truncate max-w-[200px]"
            >
              {tour.name}
            </Link>
          )}
          <span className="material-icons text-sm">chevron_right</span>
          <span className="text-gray-700 font-semibold">Book</span>
        </nav>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* ── LEFT: steps ──────────────────────────────── */}
          <form
            onSubmit={handleConfirm}
            className="order-2 lg:order-1 lg:col-span-7 space-y-5 sm:space-y-8"
          >
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                Complete Your Booking
              </h1>
              <p className="text-gray-500">
                You're just a few steps away from exploring Lisbon like a local.
              </p>
            </div>

            {/* ── STEP 1: Options ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">
                  1
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Choose Your Options
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-3">
                {/* ── Traveler ── */}
                <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 bg-gray-100 rounded-full">
                  <div className="flex items-center gap-3">
                    <span className="material-icons text-gray-500">group</span>
                    <span className="font-semibold text-gray-800">
                      Traveler
                    </span>
                    <span className="text-xs text-gray-400">
                      {sym}
                      {toDisplay(perPersonRate)} / person
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setTravelerCount((c) => Math.max(1, c - 1))
                      }
                      disabled={travelerCount <= 1}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary disabled:opacity-30 transition shadow-sm"
                    >
                      <span className="material-icons text-sm">remove</span>
                    </button>
                    <span className="w-6 text-center font-extrabold text-gray-900">
                      {travelerCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => setTravelerCount((c) => c + 1)}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:text-primary transition shadow-sm"
                    >
                      <span className="material-icons text-sm">add</span>
                    </button>
                  </div>
                </div>

                {/* ── Date Picker ── */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setDateOpen(true);
                      setTimeOpen(false);
                      setLangOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-100 rounded-full text-gray-800 font-semibold hover:bg-gray-200 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-icons text-gray-500">
                        calendar_today
                      </span>
                      <span>
                        {selDate
                          ? new Date(selDate + "T00:00:00").toLocaleDateString(
                              "en-GB",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "Select date"}
                      </span>
                    </div>
                    <span className="material-icons text-gray-400">
                      chevron_right
                    </span>
                  </button>
                </div>

                {/* ── Date Modal ── */}
                {dateOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setDateOpen(false)}
                  >
                    <div
                      className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                          Select Date
                        </h3>
                        <button
                          type="button"
                          onClick={() => setDateOpen(false)}
                          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <span className="material-icons text-base">
                            close
                          </span>
                        </button>
                      </div>
                      {/* Month navigation */}
                      <div className="flex items-center justify-between mb-4">
                        <button
                          type="button"
                          onClick={prevMonth}
                          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition"
                        >
                          <span className="material-icons text-base">
                            chevron_left
                          </span>
                        </button>
                        <span className="font-bold text-gray-900">
                          {MONTHS[calMonth]} {calYear}
                        </span>
                        <button
                          type="button"
                          onClick={nextMonth}
                          className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary hover:text-primary transition"
                        >
                          <span className="material-icons text-base">
                            chevron_right
                          </span>
                        </button>
                      </div>
                      {/* Day headers */}
                      <div className="grid grid-cols-7 mb-1">
                        {DAYS.map((d) => (
                          <div
                            key={d}
                            className="text-center text-[11px] font-bold text-gray-400 uppercase py-1"
                          >
                            {d}
                          </div>
                        ))}
                      </div>
                      {/* Day cells */}
                      <div className="grid grid-cols-7 gap-1">
                        {grid.map((d, i) => {
                          if (!d) return <div key={`e-${i}`} />;
                          const ds = toDateStr(calYear, calMonth, d);
                          const past = isPast(d);
                          const sel = selDate === ds;
                          return (
                            <button
                              key={ds}
                              type="button"
                              disabled={past}
                              onClick={() => {
                                setSelDate(ds);
                                setDateOpen(false);
                              }}
                              className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all ${
                                past
                                  ? "text-gray-300 cursor-not-allowed"
                                  : sel
                                    ? "bg-primary text-white shadow-md shadow-primary/30"
                                    : "hover:bg-primary/10 hover:text-primary text-gray-700"
                              }`}
                            >
                              {d}
                            </button>
                          );
                        })}
                      </div>
                      {!selDate && (
                        <p className="text-xs text-amber-600 mt-4 flex items-center gap-1">
                          <span className="material-icons text-sm">info</span>
                          Please select a date to continue.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* ── Time Picker ── */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setTimeOpen(true);
                      setDateOpen(false);
                      setLangOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-100 rounded-full text-gray-800 font-semibold hover:bg-gray-200 transition"
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-icons text-gray-500">
                        schedule
                      </span>
                      <span>{selTime}</span>
                    </div>
                    <span className="material-icons text-gray-400">
                      chevron_right
                    </span>
                  </button>
                </div>

                {/* ── Time Modal ── */}
                {timeOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setTimeOpen(false)}
                  >
                    <div
                      className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                          Select Time
                        </h3>
                        <button
                          type="button"
                          onClick={() => setTimeOpen(false)}
                          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <span className="material-icons text-base">
                            close
                          </span>
                        </button>
                      </div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 shrink-0">
                        Starting time
                      </p>
                      <div className="grid grid-cols-3 gap-2 overflow-y-auto pr-1">
                        {TIME_SLOTS.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => {
                              setSelTime(t);
                              setTimeOpen(false);
                            }}
                            className={`py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                              selTime === t
                                ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                                : "border-gray-200 text-gray-700 hover:border-primary/50 hover:text-primary"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Guide Language Multi-select Picker ── */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setLangOpen(true);
                      setDateOpen(false);
                      setTimeOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-100 rounded-full text-gray-800 font-semibold hover:bg-gray-200 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="material-icons text-gray-500 shrink-0">
                        language
                      </span>
                      <span className="truncate">
                        {selectedLanguages.length > 0
                          ? selectedLanguages.join(", ")
                          : "Select language"}
                      </span>
                    </div>
                    <span className="material-icons text-gray-400 shrink-0">
                      chevron_right
                    </span>
                  </button>
                </div>

                {/* ── Language Modal ── */}
                {langOpen && (
                  <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
                    onClick={() => setLangOpen(false)}
                  >
                    <div
                      className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-sm max-h-[85vh] flex flex-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-between mb-4 shrink-0">
                        <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                          Select Language
                        </h3>
                        <button
                          type="button"
                          onClick={() => setLangOpen(false)}
                          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                        >
                          <span className="material-icons text-base">
                            close
                          </span>
                        </button>
                      </div>
                      <div className="overflow-y-auto space-y-1 pr-1">
                        {ALL_LANGUAGES.map((lang) => (
                          <label
                            key={lang}
                            className="flex items-center gap-3 py-3 px-3 rounded-xl cursor-pointer hover:bg-gray-50 transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLanguages.includes(lang)}
                              onChange={() => toggleLanguage(lang)}
                              className="w-4 h-4 accent-primary rounded"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              {lang}
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="pt-4 shrink-0">
                        <button
                          type="button"
                          onClick={() => setLangOpen(false)}
                          className="w-full bg-primary text-white font-bold py-3 rounded-2xl hover:bg-primary-dark transition"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meeting point dropdown */}
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                    Meeting Point
                  </p>
                  <div className="relative">
                    <select
                      value={meetingPointId}
                      onChange={(e) =>
                        setMeetingPointId(Number(e.target.value))
                      }
                      className="w-full appearance-none bg-gray-100 rounded-full px-5 py-3.5 pr-10 text-sm font-semibold text-gray-800 outline-none transition focus:ring-2 focus:ring-primary/30 cursor-pointer"
                    >
                      {MEETING_POINTS.map((mp) => (
                        <option key={mp.id} value={mp.id}>
                          {mp.name}
                        </option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                      expand_more
                    </span>
                  </div>
                  {/* Selected meeting point note + Maps link */}
                  {(() => {
                    const mp =
                      MEETING_POINTS.find((m) => m.id === meetingPointId) ||
                      MEETING_POINTS[0];
                    return (
                      <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-start gap-3 text-sm text-gray-600">
                        <span className="material-icons text-primary text-base mt-0.5">
                          {mp.icon}
                        </span>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">{mp.note}</p>
                          <a
                            href={mp.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-primary hover:text-primary-dark transition"
                          >
                            <span className="material-icons text-sm">
                              location_on
                            </span>
                            View on Google Maps
                            <span className="material-icons text-xs">
                              open_in_new
                            </span>
                          </a>
                        </div>
                      </div>
                    );
                  })()}
                  <p className="text-xs text-gray-400 px-1 mt-1">
                    <span className="material-icons text-xs align-middle mr-0.5">
                      info
                    </span>
                    For hotel pickup, please mention your address within 2 km of
                    any meeting point.
                  </p>
                </div>
              </div>
            </div>

            {/* ── STEP 2: Contact details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">
                  2
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Your Details
                </h2>
              </div>
              <div className="p-4 sm:p-6 grid sm:grid-cols-2 gap-4 sm:gap-5">
                {[
                  {
                    f: "firstName",
                    label: "First Name",
                    icon: "person",
                    placeholder: "e.g. Sarah",
                    req: true,
                  },
                  {
                    f: "lastName",
                    label: "Last Name",
                    icon: "person",
                    placeholder: "e.g. Jenkins",
                    req: false,
                  },
                  {
                    f: "email",
                    label: "Email Address",
                    icon: "email",
                    placeholder: "sarah@example.com",
                    req: true,
                    type: "email",
                  },
                  {
                    f: "phone",
                    label: "WhatsApp / Phone",
                    icon: "phone",
                    placeholder: "+1 555 000 0000",
                    req: false,
                    type: "tel",
                  },
                ].map(({ f, label, icon, placeholder, req, type = "text" }) => (
                  <div key={f}>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      {label}
                      {req && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <div className="relative">
                      <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                        {icon}
                      </span>
                      <input
                        type={type}
                        value={form[f]}
                        onChange={setField(f)}
                        placeholder={placeholder}
                        required={req}
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 text-gray-900"
                      />
                    </div>
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Special Requests{" "}
                    <span className="normal-case font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.specialReq}
                    onChange={setField("specialReq")}
                    rows={2}
                    placeholder="Dietary needs, accessibility, anything you'd like us to know…"
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-gray-50 text-gray-900 resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ── STEP 3: Payment ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center shrink-0">
                  3
                </div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900">
                  Choose Payment Option
                </h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                {/* Pay now option */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("pay_now")}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all ${
                    paymentMode === "pay_now"
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMode === "pay_now"
                        ? "border-primary"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMode === "pay_now" && (
                      <div className="w-3 h-3 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-icons text-primary text-2xl">
                      credit_card
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">Pay with Stripe</p>
                    <p className="text-sm text-gray-500">
                      Pay now with credit card, Apple Pay, Google Pay, or more
                      via Stripe's secure checkout.
                    </p>
                  </div>
                </button>

                {/* Reserve now & pay later option */}
                <button
                  type="button"
                  onClick={() => setPaymentMode("reserve")}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 transition-all ${
                    paymentMode === "reserve"
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                      paymentMode === "reserve"
                        ? "border-green-500"
                        : "border-gray-300"
                    }`}
                  >
                    {paymentMode === "reserve" && (
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    )}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="material-icons text-green-600 text-2xl">
                      event_available
                    </span>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">
                      Reserve now & pay later
                    </p>
                    <p className="text-sm text-gray-500">
                      Keep your travel plans flexible — book your spot and pay
                      nothing today.
                    </p>
                  </div>
                </button>

                {paymentMode === "pay_now" && (
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {[
                      "Visa",
                      "Mastercard",
                      "Amex",
                      "Apple Pay",
                      "Google Pay",
                    ].map((m) => (
                      <span
                        key={m}
                        className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                )}

                {/* Free cancellation notice */}
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <span className="material-icons text-green-500 text-lg mt-0.5">
                    verified
                  </span>
                  <div>
                    <p className="font-bold text-green-800 text-sm">
                      Free cancellation
                    </p>
                    <p className="text-xs text-green-700">
                      Cancel up to 24 hours in advance for a full refund.
                      {selDate && selTime && getCancelDeadline() && (
                        <span className="block mt-1 font-semibold">
                          Cancel before{" "}
                          {getCancelDeadline().toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}{" "}
                          on{" "}
                          {getCancelDeadline().toLocaleDateString("en-GB", {
                            month: "long",
                            day: "numeric",
                          })}{" "}
                          for a full refund.
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <span className="material-icons text-green-500 text-sm">
                    lock
                  </span>
                  Payments are SSL encrypted, PCI-compliant, and 100% secure via
                  Stripe. All taxes and fees included — no hidden costs.
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!selDate || !selTime || travelerCount < 1 || submitting}
              className={`w-full ${
                paymentMode === "reserve"
                  ? "bg-green-600 hover:bg-green-700 shadow-green-600/25"
                  : "bg-primary hover:bg-primary-dark shadow-primary/25"
              } disabled:opacity-50 text-white font-bold text-base sm:text-lg py-3.5 sm:py-4 rounded-2xl shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2`}
            >
              {submitting ? (
                <>
                  <span className="material-icons animate-spin text-base">
                    sync
                  </span>
                  {paymentMode === "reserve" ? "Reserving…" : "Saving…"}
                </>
              ) : paymentMode === "reserve" ? (
                <>
                  <span className="material-icons">event_available</span>Reserve
                  Now — Pay Later
                </>
              ) : (
                <>
                  <span className="material-icons">lock</span>Proceed to Payment
                  — {sym}
                  {toDisplay(total)}
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 -mt-4">
              <span className="material-icons text-green-500 text-sm align-middle mr-1">
                event_available
              </span>
              Free cancellation up to 24 hours before the tour starts. All taxes
              and fees included.
            </p>
          </form>

          {/* ── RIGHT: sticky summary ──────────────────── */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <div className="lg:sticky lg:top-28 space-y-4 sm:space-y-5">
              {loading ? (
                <Skeleton />
              ) : tour ? (
                <>
                  {/* Tour card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="relative h-36 sm:h-48">
                      <img
                        src={tour.title_image}
                        alt={tour.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-4 left-4 text-white">
                        <div className="flex items-center gap-1 bg-primary px-2 py-0.5 rounded-full text-xs font-bold w-max mb-1">
                          <span className="material-icons text-xs">star</span>
                          {Number(tour.rating).toFixed(1)} ({tour.review_count}{" "}
                          reviews)
                        </div>
                        <h3 className="text-lg font-extrabold leading-snug">
                          {tour.name}
                        </h3>
                        {tour.subtitle && (
                          <p className="text-white/80 text-xs">
                            {tour.subtitle}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="p-4 sm:p-5 space-y-3 sm:space-y-4">
                      {/* Currency toggle */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                          Price
                        </span>
                        <div className="flex bg-gray-100 rounded-full p-0.5">
                          <button
                            type="button"
                            onClick={() => setCurrency("USD")}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                              currency === "USD"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            $ USD
                          </button>
                          <button
                            type="button"
                            onClick={() => setCurrency("EUR")}
                            className={`px-3 py-1 text-xs font-bold rounded-full transition-all ${
                              currency === "EUR"
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                          >
                            € EUR
                          </button>
                        </div>
                      </div>

                      {/* Quick info */}
                      <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-primary text-base">
                            schedule
                          </span>
                          <span>
                            {tour.duration} Hour{tour.duration !== 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-primary text-base">
                            groups
                          </span>
                          <span>Private Tour</span>
                        </div>
                        {selDate && (
                          <div className="flex items-center gap-2 col-span-2">
                            <span className="material-icons text-primary text-base">
                              event
                            </span>
                            <span className="font-semibold text-gray-900">
                              {new Date(
                                selDate + "T00:00:00",
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              · {selTime}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-primary text-base">
                            language
                          </span>
                          <span>
                            {selectedLanguages.length > 0
                              ? selectedLanguages.join(", ")
                              : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-primary text-base">
                            eco
                          </span>
                          <span>100% Electric</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-200" />

                      {/* Group discount badge */}
                      {travelerCount >= 2 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-xs">
                          <span className="material-icons text-green-500 text-sm align-middle mr-1">
                            local_offer
                          </span>
                          <span className="text-green-800 font-semibold">
                            Group discount applied! {sym}
                            {toDisplay(perPersonRate)}/person
                            {travelerCount >= 6 && " — best rate!"}
                          </span>
                        </div>
                      )}

                      {/* Price breakdown */}
                      <div className="space-y-1.5 text-sm">
                        {travelerCount > 0 && (
                          <div className="flex justify-between text-gray-600">
                            <span>
                              {travelerCount} Traveler
                              {travelerCount > 1 ? "s" : ""} × {sym}
                              {toDisplay(perPersonRate)}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {sym}
                              {toDisplay(subtotal)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                          <div>
                            <span className="font-bold text-gray-900 text-base">
                              Total
                            </span>
                            <p className="text-xs text-gray-400">
                              All taxes and fees included
                            </p>
                          </div>
                          <span className="font-extrabold text-2xl text-primary">
                            {sym}
                            {toDisplay(total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Perks */}
                  <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    {[
                      {
                        icon: "event_available",
                        color: "text-green-500",
                        text: "Free cancellation up to 24h before",
                        sub: "Cancel up to 24 hours in advance for a full refund",
                      },
                      {
                        icon: "payments",
                        color: "text-blue-500",
                        text: "Reserve now & pay later",
                        sub: "Keep your travel plans flexible — pay nothing today",
                      },
                      {
                        icon: "person",
                        color: "text-primary",
                        text: "100% private — just your group",
                        sub: null,
                      },
                      {
                        icon: "receipt_long",
                        color: "text-purple-500",
                        text: "No hidden costs",
                        sub: "All taxes and fees included in the price shown",
                      },
                    ].map((p) => (
                      <div
                        key={p.text}
                        className="flex items-start gap-3 text-sm"
                      >
                        <span
                          className={`material-icons text-base ${p.color} mt-0.5`}
                        >
                          {p.icon}
                        </span>
                        <div>
                          <span className="text-gray-700 font-medium">
                            {p.text}
                          </span>
                          {p.sub && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {p.sub}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Need help */}
                  <a
                    href="/contact"
                    className="hidden sm:flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary transition font-medium"
                  >
                    <span className="material-icons text-base">
                      chat_bubble_outline
                    </span>
                    Not ready? Chat with us directly.
                  </a>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Booking;
