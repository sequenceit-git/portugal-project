import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";

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

// Passenger type definitions
const PTYPE = [
  { key: "adult", label: "Adult", sub: "Age 13+", rate: 1.0 },
  { key: "youth", label: "Youth", sub: "Age 3–12", rate: 0.7 },
  { key: "senior", label: "Senior", sub: "Age 60+", rate: 0.9 },
  { key: "infant", label: "Infant", sub: "Age 0–2", rate: 0 },
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

  // Step selections
  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [selDate, setSelDate] = useState(null); // "YYYY-MM-DD"
  const [selTime, setSelTime] = useState(TIME_SLOTS[0]);
  const [passengers, setPassengers] = useState({
    adult: 1,
    youth: 0,
    infant: 0,
    senior: 0,
  });
  const adjPax = (key, delta) =>
    setPassengers((p) => ({
      ...p,
      [key]: Math.max(key === "adult" ? 1 : 0, p[key] + delta),
    }));
  const [language, setLanguage] = useState("English");
  const [languages, setLanguages] = useState(["English"]);

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
  const [payment, setPayment] = useState("credit-card");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
          "id,name,subtitle,category,title_image,duration,people,guide_language,meeting_point,highlights,rating,review_count,price,details,activity",
        )
        .eq("id", tourId)
        .single();
      if (!error && data) {
        setTour(data);
        setPassengers({ adult: 1, youth: 0, infant: 0, senior: 0 });
        const langs = data.guide_language
          ? data.guide_language
              .split(/[,/]/)
              .map((l) => l.trim())
              .filter(Boolean)
          : ["English"];
        setLanguages(langs);
        setLanguage(langs[0]);
      }
      setLoading(false);
    };
    load();
  }, [tourId]);

  const price = tour?.price ? Number(tour.price) : 0;
  const totalGuests =
    passengers.adult + passengers.youth + passengers.infant + passengers.senior;
  const subtotal =
    passengers.adult * price * 1.0 +
    passengers.youth * price * 0.7 +
    passengers.senior * price * 0.9 +
    passengers.infant * 0; // infants free
  const serviceFee = totalGuests > 0 ? 2.5 : 0;
  const total = subtotal + serviceFee;

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
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        tour_id: tourId ? Number(tourId) : null,
        tour_name: tour?.name ?? null,
        booking_date: selDate,
        booking_time: selTime,
        language: language,
        adults: passengers.adult,
        youth: passengers.youth,
        infants: passengers.infant,
        seniors: passengers.senior,
        total_guests: totalGuests,
        first_name: form.firstName,
        last_name: form.lastName || null,
        email: form.email,
        phone: form.phone || null,
        special_requests: form.specialReq || null,
        payment_method: payment,
        subtotal: parseFloat(subtotal.toFixed(2)),
        service_fee: serviceFee,
        total_amount: parseFloat(total.toFixed(2)),
        status: "pending",
      });
      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      console.error("Booking save failed:", err);
      alert("Could not save your booking. Please try again.");
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
            check_circle
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          Booking Confirmed!
        </h1>
        <p className="text-gray-500 max-w-md">
          Thank you, <strong>{form.firstName}</strong>! Your booking for{" "}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
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
          <form onSubmit={handleConfirm} className="lg:col-span-7 space-y-8">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                Complete Your Booking
              </h1>
              <p className="text-gray-500">
                You're just a few steps away from exploring Lisbon like a local.
              </p>
            </div>

            {/* ── STEP 1: Options ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                  1
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Choose Your Options
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Passenger types */}
                <div>
                  <p className="font-semibold text-gray-900 mb-1">Passengers</p>
                  <p className="text-xs text-gray-400 mb-4">
                    At least 1 adult required · infants travel free
                  </p>
                  <div className="space-y-3">
                    {PTYPE.map(({ key, label, sub, rate }) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {label}
                          </p>
                          <p className="text-xs text-gray-400">
                            {sub}
                            {rate > 0
                              ? ` · €${(price * rate).toFixed(2)}/person`
                              : " · Free"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl p-1">
                          <button
                            type="button"
                            onClick={() => adjPax(key, -1)}
                            disabled={
                              passengers[key] <= (key === "adult" ? 1 : 0)
                            }
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary disabled:opacity-30 transition"
                          >
                            <span className="material-icons text-sm">
                              remove
                            </span>
                          </button>
                          <span className="w-5 text-center font-extrabold text-gray-900 text-sm">
                            {passengers[key]}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjPax(key, 1)}
                            className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:text-primary transition"
                          >
                            <span className="material-icons text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalGuests > 0 && (
                    <p className="text-xs text-primary font-semibold mt-3 flex items-center gap-1">
                      <span className="material-icons text-sm">group</span>
                      {totalGuests} guest{totalGuests > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>

                {/* Language */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-gray-900">
                      Guide Language
                    </p>
                    <p className="text-sm text-gray-400">
                      Select your preferred language
                    </p>
                  </div>
                  <div className="relative">
                    <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-primary text-base pointer-events-none">
                      language
                    </span>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 bg-white outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary appearance-none cursor-pointer"
                    >
                      {languages.map((l) => (
                        <option key={l}>{l}</option>
                      ))}
                    </select>
                    <span className="material-icons absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── STEP 2: Date & Time ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                  2
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Pick a Date &amp; Time
                </h2>
              </div>
              <div className="p-6 space-y-6">
                {/* Calendar */}
                <div>
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
                          onClick={() => setSelDate(ds)}
                          className={`aspect-square flex items-center justify-center rounded-xl text-sm font-semibold transition-all
                            ${
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
                    <p className="text-xs text-amber-600 mt-3 flex items-center gap-1">
                      <span className="material-icons text-sm">info</span>
                      Please select a date to continue.
                    </p>
                  )}
                  {selDate && (
                    <p className="text-xs text-primary mt-3 flex items-center gap-1 font-semibold">
                      <span className="material-icons text-sm">
                        event_available
                      </span>
                      Selected:{" "}
                      {new Date(selDate + "T00:00:00").toLocaleDateString(
                        "en-GB",
                        {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        },
                      )}
                    </p>
                  )}
                </div>

                {/* Time slots */}
                <div>
                  <p className="font-semibold text-gray-900 mb-3">
                    Select a Starting Time
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelTime(t)}
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

                {tour?.meeting_point && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
                    <span className="material-icons text-primary text-base mt-0.5">
                      location_on
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 mb-0.5">
                        Meeting Point
                      </p>
                      <p>{tour.meeting_point}</p>
                    </div>
                  </div>
                )}
                {!tour?.meeting_point && (
                  <div className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-600">
                    <span className="material-icons text-primary text-base mt-0.5">
                      near_me
                    </span>
                    <div>
                      <p className="font-semibold text-gray-800 mb-0.5">
                        Pickup Area
                      </p>
                      <p>
                        Flexible — exact pickup point confirmed after booking.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── STEP 3: Contact details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                  3
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Your Details
                </h2>
              </div>
              <div className="p-6 grid sm:grid-cols-2 gap-5">
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

            {/* ── STEP 4: Payment ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-primary text-white font-bold text-sm flex items-center justify-center">
                  4
                </div>
                <h2 className="text-lg font-bold text-gray-900">
                  Secure Payment
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {
                    id: "credit-card",
                    label: "Credit / Debit Card",
                    icon: "credit_card",
                  },
                  { id: "apple-pay", label: "Apple Pay", icon: "phone_iphone" },
                  {
                    id: "paypal",
                    label: "PayPal",
                    icon: "account_balance_wallet",
                  },
                ].map(({ id, label, icon }) => (
                  <label key={id} className="cursor-pointer block">
                    <input
                      type="radio"
                      name="payment"
                      value={id}
                      checked={payment === id}
                      onChange={() => setPayment(id)}
                      className="sr-only"
                    />
                    <div
                      className={`flex items-center justify-between px-5 py-4 rounded-xl border-2 transition-all ${payment === id ? "border-primary bg-primary/5" : "border-gray-200 hover:border-primary/30"}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${payment === id ? "border-primary bg-primary" : "border-gray-300"}`}
                        >
                          {payment === id && (
                            <div className="w-2 h-2 bg-white rounded-full" />
                          )}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {label}
                        </span>
                      </div>
                      <span className="material-icons text-gray-400">
                        {icon}
                      </span>
                    </div>
                  </label>
                ))}

                {payment === "credit-card" && (
                  <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 space-y-4 mt-2">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                        Card Number
                      </label>
                      <div className="relative">
                        <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-base">
                          lock
                        </span>
                        <input
                          type="text"
                          placeholder="0000 0000 0000 0000"
                          className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          Expiry
                        </label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                          CVC
                        </label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-400 pt-1">
                  <span className="material-icons text-green-500 text-sm">
                    lock
                  </span>
                  Payments are SSL encrypted and 100% secure.
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!selDate || totalGuests === 0 || submitting}
              className="w-full bg-primary hover:bg-primary-dark disabled:opacity-50 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-primary/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="material-icons animate-spin text-base">
                    sync
                  </span>
                  Saving…
                </>
              ) : (
                <>
                  <span className="material-icons">check_circle</span>Confirm
                  &amp; Pay — €{total.toFixed(2)}
                </>
              )}
            </button>
            <p className="text-center text-xs text-gray-400 -mt-4">
              <span className="material-icons text-green-500 text-sm align-middle mr-1">
                event_available
              </span>
              Free cancellation up to 24 hours before the tour starts.
            </p>
          </form>

          {/* ── RIGHT: sticky summary ──────────────────── */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-5">
              {loading ? (
                <Skeleton />
              ) : tour ? (
                <>
                  {/* Tour card */}
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="relative h-48">
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
                    <div className="p-5 space-y-4">
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
                          <span>{language}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="material-icons text-primary text-base">
                            eco
                          </span>
                          <span>100% Electric</span>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-gray-200" />

                      {/* Price breakdown */}
                      <div className="space-y-1.5 text-sm">
                        {PTYPE.filter(({ key }) => passengers[key] > 0).map(
                          ({ key, label, rate }) => (
                            <div
                              key={key}
                              className="flex justify-between text-gray-600"
                            >
                              <span>
                                {passengers[key]} {label}
                                {passengers[key] > 1 ? "s" : ""}
                                {rate > 0
                                  ? ` × €${(price * rate).toFixed(2)}`
                                  : " (free)"}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {rate > 0
                                  ? `€${(passengers[key] * price * rate).toFixed(2)}`
                                  : "€0.00"}
                              </span>
                            </div>
                          ),
                        )}
                        <div className="flex justify-between text-gray-500">
                          <span>Service Fee</span>
                          <span>€{serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-end pt-2 border-t border-gray-100">
                          <span className="font-bold text-gray-900 text-base">
                            Total
                          </span>
                          <span className="font-extrabold text-2xl text-primary">
                            €{total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Perks */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                    {[
                      {
                        icon: "event_available",
                        color: "text-green-500",
                        text: "Free cancellation up to 24h before",
                      },
                      {
                        icon: "payments",
                        color: "text-blue-500",
                        text: "Reserve now & pay later option",
                      },
                      {
                        icon: "person",
                        color: "text-primary",
                        text: "100% private — just your group",
                      },
                    ].map((p) => (
                      <div
                        key={p.text}
                        className="flex items-center gap-3 text-sm text-gray-600"
                      >
                        <span className={`material-icons text-base ${p.color}`}>
                          {p.icon}
                        </span>
                        {p.text}
                      </div>
                    ))}
                  </div>

                  {/* Need help */}
                  <a
                    href="/contact"
                    className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary transition font-medium"
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
