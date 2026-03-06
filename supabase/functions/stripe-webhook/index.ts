// supabase/functions/stripe-webhook/index.ts
// Deno Edge Function — handles Stripe webhook events

import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, stripe-signature",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    if (!stripeSecretKey || !webhookSecret) {
      throw new Error("Missing Stripe environment variables");
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2024-04-10",
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Supabase service-role client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read raw body for signature verification
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");

    if (!sig) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Received Stripe event: ${event.type}`);

    // Handle checkout.session.completed
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const sessionId = session.id;

      console.log(`Checkout completed for booking ${bookingId}, session ${sessionId}`);

      // Update payment record
      await supabase
        .from("payments")
        .update({
          status: "paid",
          stripe_payment_intent:
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent?.id || null,
          receipt_url: null, // Will be updated if charge has receipt
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", sessionId);

      // Update booking status
      if (bookingId) {
        await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
          })
          .eq("id", parseInt(bookingId));
      }

      // Try to get receipt URL from the charge
      if (session.payment_intent) {
        try {
          const piId =
            typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id;
          const pi = await stripe.paymentIntents.retrieve(piId);
          if (pi.latest_charge) {
            const chargeId =
              typeof pi.latest_charge === "string"
                ? pi.latest_charge
                : pi.latest_charge.id;
            const charge = await stripe.charges.retrieve(chargeId);
            if (charge.receipt_url) {
              await supabase
                .from("payments")
                .update({ receipt_url: charge.receipt_url })
                .eq("stripe_session_id", sessionId);
            }
          }
        } catch (e) {
          console.error("Could not fetch receipt URL:", e);
        }
      }
    }

    // Handle checkout.session.expired (mark as failed)
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const sessionId = session.id;

      console.log(`Checkout expired for booking ${bookingId}, session ${sessionId}`);

      // Update payment record (if it exists)
      await supabase
        .from("payments")
        .update({
          status: "failed",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_session_id", sessionId);

      // Update booking — cancel it and free the capacity
      if (bookingId) {
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
            payment_status: "failed",
          })
          .eq("id", parseInt(bookingId))
          .in("status", ["pending"]); // Don't cancel if already confirmed
      }
    }

    // Handle charge.refunded — sync to both payments AND bookings
    if (event.type === "charge.refunded") {
      const charge = event.data.object as Stripe.Charge;
      const piId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

      if (piId) {
        // Update payment record
        await supabase
          .from("payments")
          .update({
            status: "refunded",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_payment_intent", piId);

        // Also update the booking status via the payment's booking_id
        const { data: payment } = await supabase
          .from("payments")
          .select("booking_id")
          .eq("stripe_payment_intent", piId)
          .single();

        if (payment?.booking_id) {
          await supabase
            .from("bookings")
            .update({
              status: "cancelled",
              payment_status: "refunded",
            })
            .eq("id", payment.booking_id);
        }
      }
    }

    // Handle payment_intent.payment_failed — mark booking as failed
    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object as Stripe.PaymentIntent;

      // Find the payment by payment_intent
      const { data: payment } = await supabase
        .from("payments")
        .select("id, booking_id")
        .eq("stripe_payment_intent", pi.id)
        .single();

      if (payment) {
        await supabase
          .from("payments")
          .update({
            status: "failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", payment.id);

        if (payment.booking_id) {
          await supabase
            .from("bookings")
            .update({
              status: "cancelled",
              payment_status: "failed",
            })
            .eq("id", payment.booking_id);
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
