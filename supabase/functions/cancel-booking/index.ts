// supabase/functions/cancel-booking/index.ts
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { bookingId, reason } = await req.json();

    if (!bookingId || !reason) {
      return new Response(JSON.stringify({ error: "Booking ID and reason are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*, stripe_payment_intent, payment_status")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      return new Response(JSON.stringify({ error: "Booking not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (booking.status === "cancelled") {
      return new Response(JSON.stringify({ error: "Booking is already cancelled" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse tour date and time to check 24h window
    // booking.booking_date is YYYY-MM-DD
    // booking.booking_time is like "09:00" or "14:30"
    const tourDateTime = new Date(`${booking.booking_date}T${booking.booking_time}:00`);
    const now = new Date();
    
    const hoursDifference = (tourDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursDifference < 24) {
      return new Response(JSON.stringify({ error: "Cancellations are only allowed up to 24 hours before the tour start time." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Now issue refund if paid
    let refunded = false;
  if (booking.stripe_payment_intent && booking.payment_status === "paid") {
      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeSecretKey) {
          throw new Error("Payment service unavailable - missing API key");
      }
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2024-04-10",
        httpClient: Stripe.createFetchHttpClient(),
      });

      try {
        await stripe.refunds.create({
          payment_intent: payment.stripe_payment_intent,
        });
        refunded = true;
      } catch (stripeErr) {
        console.error("Stripe refund error:", stripeErr);
        return new Response(JSON.stringify({ error: "Failed to process refund: " + stripeErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Update booking to add cancellation reason / date
    // The webhook might update status, but let's do it here preemptively as well
    await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    // Send Cancellation Email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (resendKey && booking.email) {
      const htmlEmail = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
          <h2 style="color: #ef4444;">Booking Cancelled</h2>
          <p>Hi ${booking.first_name},</p>
          <p>We're writing to confirm that your booking for <strong>${booking.tour_name}</strong> on <strong>${booking.booking_date}</strong> at <strong>${booking.booking_time}</strong> has been successfully cancelled.</p>
          ${refunded ? `<p>A full refund has been issued to your original payment method. Please allow 5-10 business days for the funds to appear on your statement.</p>` : ''}
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
            <p style="margin: 0 0 10px 0;"><strong>Booking ID:</strong> #${booking.id}</p>
            <p style="margin: 0;"><strong>Reason:</strong> ${reason}</p>
          </div>
          <p>We're sorry to see you go! If your plans change, we'd love to show you the best of Lisbon on a future trip.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/tours" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Browse Our Tours</a>
          </div>
          <br/>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px;">The Tuk in Lisbon Team</p>
        </div>
      `;

      try {
        const emailReq = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: "Tuk in Lisbon <bookings@tukinlisbon.com>",
            to: [booking.email],
            subject: `Cancellation Confirmed - ${booking.tour_name || "Tour"}`,
            html: htmlEmail,
          })
        });

        if (!emailReq.ok) {
          console.error("Failed to send cancellation email:", await emailReq.text());
        } else {
          console.log(`Successfully sent cancellation email to ${booking.email}`);
        }
      } catch (mailError) {
        console.error("Error sending cancellation email:", mailError);
      }
    }

    return new Response(JSON.stringify({ success: true, refunded }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("cancel-booking error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
