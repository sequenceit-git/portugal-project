import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabaseClient";

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
      .select(
        `
        *,
        booking:bookings (
          id, tour_id, tour_name, booking_date, booking_time,
          language, total_guests,
          first_name, last_name, email, phone, special_requests,
          subtotal, service_fee, total_amount, status
        )
      `,
      )
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
        currency: st.currency || "usd",
        status,
        customer_name: st.customer_name || local?.customer_name || "—",
        customer_email:
          st.customer_email || st.receipt_email || local?.customer_email || "—",
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
          <span className="material-icons text-primary text-base">
            bar_chart
          </span>
          Monthly Revenue (Last 6 Months)
        </h3>
        <div className="flex items-end gap-3 h-32">
          {monthlyRevenue.map((m) => (
            <div
              key={m.key}
              className="flex-1 flex flex-col items-center gap-1"
            >
              <span className="text-[10px] font-bold text-gray-500">
                ${m.revenue > 0 ? m.revenue.toFixed(0) : "0"}
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
                  {s}{" "}
                  <span className="ml-1 opacity-70">({counts[s] ?? 0})</span>
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
            <span className="material-icons animate-spin text-primary text-3xl">
              sync
            </span>
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
                    {[
                      "Customer",
                      "Tour",
                      "Amount",
                      "Status",
                      "Date",
                      "Session",
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
                  {visible.map((p) => (
                    <React.Fragment key={p.id}>
                      <tr className="hover:bg-gray-50/60 transition">
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
                            {new Date(p.created_at).toLocaleTimeString(
                              "en-GB",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p
                            className="text-xs text-gray-400 font-mono truncate max-w-[120px]"
                            title={p.stripe_session_id}
                          >
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
                              {expanding === p.id
                                ? "expand_less"
                                : "expand_more"}
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
                                {
                                  label: "Payment ID",
                                  value:
                                    typeof p.id === "number"
                                      ? `#${p.id}`
                                      : `${(p.id || "").slice(0, 16)}…`,
                                },
                                {
                                  label: "Booking ID",
                                  value: p.booking_id
                                    ? `#${p.booking_id.slice(0, 8)}…`
                                    : "—",
                                },
                                {
                                  label: "Booking Date",
                                  value: p.booking?.booking_date
                                    ? new Date(
                                        p.booking.booking_date + "T00:00:00",
                                      ).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })
                                    : "—",
                                },
                                {
                                  label: "Booking Time",
                                  value: p.booking?.booking_time || "—",
                                },
                                {
                                  label: "Guests",
                                  value: p.booking
                                    ? `${p.booking.total_guests || 0} Travelers`
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
                                  value: new Date(p.created_at).toLocaleString(
                                    "en-GB",
                                  ),
                                },
                                {
                                  label: "Data Source",
                                  value:
                                    p._source === "stripe_sync"
                                      ? "Stripe Sync"
                                      : "Local",
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
                    </React.Fragment>
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
                        {
                          label: "Booking ID",
                          value: p.booking_id ? `#${p.booking_id}` : "—",
                        },
                        {
                          label: "Session",
                          value: p.stripe_session_id
                            ? `…${p.stripe_session_id.slice(-12)}`
                            : "—",
                        },
                        {
                          label: "Created",
                          value: new Date(p.created_at).toLocaleDateString(
                            "en-GB",
                          ),
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
export default TransactionsManager;
