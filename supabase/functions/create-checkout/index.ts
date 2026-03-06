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

    // ── Server-side price validation ─────────────────────────
    // Look up the booking to get tour_id and passenger count,
    // then look up the tour to get the authoritative price.
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

    // Try to resolve the tour price from the database
    let tourPrice: number | null = null;
    let tourName = booking.tour_name || "Tour Booking";

    if (booking.tour_id) {
      const { data: tour } = await supabase
        .from("tours")
        .select("price, name")
        .eq("id", booking.tour_id)
        .single();
      if (tour) {
        tourPrice = tour.price;
        tourName = tour.name || tourName;
      }
    }

    // If we couldn't find a tour by ID, try by name
    if (tourPrice === null && booking.tour_name) {
      const { data: tour } = await supabase
        .from("tours")
        .select("price, name")
        .eq("name", booking.tour_name)
        .single();
      if (tour) {
        tourPrice = tour.price;
        tourName = tour.name || tourName;
      }
    }

    // Calculate the server-side total
    const paxCount = booking.total_guests || passengers || 1;
    const serverTotal = tourPrice !== null
      ? tourPrice * paxCount
      : null;

    // If we have a server-verified price, use it; otherwise reject
    if (serverTotal === null) {
      console.error(`Could not resolve price for booking ${bookingId}`);
      return new Response(
        JSON.stringify({ error: "Unable to determine tour price. Please contact support." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
            currency: "eur",
            product_data: {
              name: tourName,
              description: `${paxCount} guest(s) · ${bookingDate || ""} · ${bookingTime || ""}`,
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
