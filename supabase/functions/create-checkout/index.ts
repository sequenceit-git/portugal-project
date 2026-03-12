// supabase/functions/create-checkout/index.ts
// Deno Edge Function — creates a Stripe Checkout Session
// Security: server-side price validation, restricted CORS, sanitised errors

import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

// ── Allowed origins ──────────────────────────────────────────
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://tukinlisbon.com",
  "https://www.tukinlisbon.com",
];

const SITE_URL =
  Deno.env.get("SITE_URL") || "https://tukinlisbon.com"; // fallback for success/cancel

// ── Group discount pricing ──────────────────────────────────
const GROUP_DISCOUNTS = [
  { min: 6, pct: 0.30 },  // 6+ → 30% off
  { min: 5, pct: 0.25 },  // 5   → 25% off
  { min: 4, pct: 0.20 },  // 4   → 20% off
  { min: 3, pct: 0.15 },  // 3   → 15% off
  { min: 2, pct: 0.10 },  // 2   → 10% off
];

function getPerPersonRate(count: number, basePrice: number): number {
  const tier = GROUP_DISCOUNTS.find((t) => count >= t.min);
  if (!tier) return basePrice; // 1 person → full price
  return Math.round(basePrice * (1 - tier.pct) * 100) / 100;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeSecretKey) {
      console.error("STRIPE_SECRET_KEY not set");
      return new Response(
        JSON.stringify({ error: "Payment service unavailable" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Supabase client with service role key (server-side, bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const {
      bookingId,
      customerEmail,
      customerName,
      passengers,
      bookingDate,
      bookingTime,
    } = body;

    if (!bookingId || !customerEmail) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── Server-side price validation (group discount) ─────────
    // Look up the booking to get tour_id and passenger count
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("id, tour_name, total_guests, tour_id")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    let tourName = booking.tour_name || "Tour Booking";
    let tourBasePrice = 0;

    // Resolve tour name and base price from the database
    if (booking.tour_id) {
      const { data: tour } = await supabase
        .from("tours")
        .select("name, price")
        .eq("id", booking.tour_id)
        .single();
      if (tour) {
        tourName = tour.name || tourName;
        tourBasePrice = Number(tour.price) || 0;
      }
    }

    if (tourBasePrice <= 0) {
      return new Response(
        JSON.stringify({ error: "Tour price not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Calculate the server-side total using group discount pricing
    const paxCount = booking.total_guests || passengers || 1;
    const perPersonRate = getPerPersonRate(paxCount, tourBasePrice);
    const serverTotal = perPersonRate * paxCount; // no service fee

    // ── Determine redirect URLs (hardcoded allowed origins) ──
    const reqOrigin = req.headers.get("origin") || "";
    const redirectBase = ALLOWED_ORIGINS.includes(reqOrigin)
      ? reqOrigin
      : SITE_URL;

    // Create Stripe Checkout Session
    // Expire after 30 minutes so abandoned bookings free up capacity quickly
    const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes from now

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: customerEmail,
      expires_at: expiresAt,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: tourName,
              description: `${paxCount} guest(s) × $${perPersonRate}/person · ${bookingDate || ""} · ${bookingTime || ""}`,
            },
            unit_amount: Math.round(serverTotal * 100), // Stripe uses cents
          },
          quantity: 1,
        },
      ],
      metadata: {
        booking_id: String(bookingId),
        customer_name: customerName || "",
        tour_name: tourName,
      },
      success_url: `${redirectBase}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${redirectBase}/booking/cancel?booking_id=${bookingId}`,
    });

    // Insert payment record (pending)
    await supabase.from("payments").insert({
      booking_id: bookingId,
      stripe_session_id: session.id,
      amount: serverTotal,
      currency: "usd",
      status: "pending",
      customer_email: customerEmail,
      customer_name: customerName || null,
      tour_name: tourName,
    });

    // Update booking with stripe session id
    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", bookingId);

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    // Never leak internal error details to the client
    console.error("create-checkout error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      {
        status: 500,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      },
    );
  }
});
