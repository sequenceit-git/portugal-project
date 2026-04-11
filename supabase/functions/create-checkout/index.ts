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

// ── Tour-Specific Per-Person Pricing ────────────────────────
const getTourPerPersonRate = (tour: any, travelerCount: number) => {
  if (!tour) return 0;
  const count = Math.max(1, travelerCount);
  if (count === 1) return Number(tour.price_1_person) || 0;
  if (count === 2) return Number(tour.price_2_person) || 0;
  if (count === 3) return Number(tour.price_3_person) || 0;
  if (count === 4) return Number(tour.price_4_person) || 0;
  if (count === 5) return Number(tour.price_5_person) || 0;
  return Number(tour.price_6_person) || 0;
};

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

    // Supabase client with user access token to adhere to RLS
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: authHeader || "" },
      },
    });

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
    let perPersonRate = 0;
    const paxCount = booking.total_guests || passengers || 1;

    // Resolve tour name and base price from the database
    if (booking.tour_id) {
      const { data: tour } = await supabase
        .from("tours")
        .select("name, price_1_person, price_2_person, price_3_person, price_4_person, price_5_person, price_6_person")
        .eq("id", booking.tour_id)
        .single();
      if (tour) {
        tourName = tour.name || tourName;
        perPersonRate = getTourPerPersonRate(tour, paxCount);
      }
    }

    if (perPersonRate <= 0) {
      return new Response(
        JSON.stringify({ error: "Tour price not found" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Calculate the server-side total
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
      submit_type: "book",
      customer_email: customerEmail,
      customer_creation: "always",
      expires_at: expiresAt,
      payment_intent_data: {
        receipt_email: customerEmail,
      },
      custom_text: {
        submit: {
          message: "You can cancel for free up to 24 hours before your tour starts.",
        },
      },
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: tourName,
              description: `${paxCount} guest(s) × $${perPersonRate}/person · ${bookingDate || ""} · ${bookingTime || ""} · Free cancellation up to 24h before`,
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
      currency: "eur",
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
