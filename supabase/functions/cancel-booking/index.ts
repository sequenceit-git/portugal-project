// supabase/functions/cancel-booking/index.ts
import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
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
    const { bookingId, reason, isAdmin } = await req.json();

    if (!bookingId || !reason) {
      return new Response(JSON.stringify({ error: "Booking ID and reason are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch booking details (use * to get all columns)
    const { data: booking, error: bookingErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (bookingErr || !booking) {
      console.error("Booking fetch error:", bookingErr);
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
    let hoursDifference = Infinity; // default: allow cancellation
    try {
      const timeStr = (booking.booking_time || "00:00").replace(/\s*(AM|PM)/i, "");
      const tourDateTime = new Date(`${booking.booking_date}T${timeStr}:00`);
      if (!isNaN(tourDateTime.getTime())) {
        const now = new Date();
        hoursDifference = (tourDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      }
    } catch (dateErr) {
      console.error("Date parsing error:", dateErr);
    }

    if (!isAdmin && hoursDifference < 24) {
      return new Response(JSON.stringify({ error: "Cancellations are only allowed up to 24 hours before the tour start time." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Now issue refund if paid
    let refunded = false;
    if (booking.payment_status === "paid") {
      const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
      if (!stripeSecretKey) {
        console.error("STRIPE_SECRET_KEY not set — cannot process refund");
        return new Response(JSON.stringify({ error: "Payment service unavailable" }), {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const stripe = new Stripe(stripeSecretKey, {
        apiVersion: "2024-04-10",
        httpClient: Stripe.createFetchHttpClient(),
      });

      // Resolve payment_intent — prefer stored value, fallback to Stripe session lookup
      let paymentIntentId = booking.stripe_payment_intent || null;
      if (!paymentIntentId && booking.stripe_session_id) {
        try {
          const session = await stripe.checkout.sessions.retrieve(booking.stripe_session_id);
          if (session.payment_intent) {
            paymentIntentId = typeof session.payment_intent === "string"
              ? session.payment_intent
              : session.payment_intent.id;
          }
        } catch (e) {
          console.error("Could not retrieve session for refund:", e);
        }
      }

      if (paymentIntentId) {
        try {
          await stripe.refunds.create({
            payment_intent: paymentIntentId,
          });
          refunded = true;
          console.log(`Refund issued for booking ${bookingId}, payment_intent ${paymentIntentId}`);
        } catch (stripeErr) {
          console.error("Stripe refund error:", stripeErr);
          const errorMsg = stripeErr?.message || "";
          
          if (errorMsg.includes("has already been refunded") || errorMsg.includes("already refunded")) {
            console.log(`Booking ${bookingId} was already refunded on Stripe. Proceeding with cancellation.`);
            refunded = true;
          } else {
            return new Response(JSON.stringify({ error: "Failed to process refund: " + errorMsg }), {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
        }
      } else {
        console.warn(`Booking ${bookingId} is paid but no payment_intent found — skipping refund`);
      }
    }

    // Update booking to add cancellation reason / date and refund status
    const { error: updateErr } = await supabase
      .from("bookings")
      .update({
        status: "cancelled",
        payment_status: refunded ? "refunded" : (booking.payment_status === "paid" ? "paid" : booking.payment_status),
        cancellation_reason: reason,
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", bookingId);

    if (updateErr) {
      console.error("Failed to update booking:", updateErr);
    }

    // Send Cancellation Email via Resend
    const resendKey = Deno.env.get("RESEND_API_KEY") || Deno.env.get("Resend_API_Key");
    if (resendKey && booking.email) {
      const customerName = `${booking.first_name} ${booking.last_name || ""}`.trim();
      const tourName = booking.tour_name || "Tour";
      const adminEmail = "tukinlisbon2@gmail.com";
      const siteUrl = Deno.env.get("SITE_URL") || "https://tukinlisbon.com";

      const bookingDetailsHtml = `
        <div style="background-color: #ffffff; border-radius: 12px; margin: 20px 0; padding: 25px; border: 1px solid #f0f0f0; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <h3 style="margin-top: 0; color: #ef4444; font-size: 18px; border-bottom: 2px solid #fef2f2; padding-bottom: 10px;">Cancelled Booking Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280; width: 40%;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${customerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${booking.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${booking.phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Travelers:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${booking.total_guests || 0} Guest(s)</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Amount:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: ${refunded ? '#10b981' : '#6b7280'}; font-weight: bold;">&euro;${Number(booking.total_amount || 0).toFixed(2)} ${refunded ? '(Refunded)' : ''}</td>
            </tr>
          </table>

          <h3 style="margin-top: 0; color: #ef4444; font-size: 18px; border-bottom: 2px solid #fef2f2; padding-bottom: 10px;">Tour Information</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280; width: 40%;"><strong>Tour Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827; font-weight: bold;">${tourName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Date:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${booking.booking_date || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Time:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${booking.booking_time || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Cancellation Reason:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${reason}</td>
            </tr>
          </table>

          ${refunded ? '<div style="background-color: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 15px;"><p style="margin: 0 0 5px 0; color: #111827; font-weight: bold;">Refund Issued</p><p style="margin: 0; color: #4b5563; font-size: 14px;">A full refund of &euro;' + Number(booking.total_amount || 0).toFixed(2) + ' has been issued to your original payment method. Please allow 5-10 business days for the funds to appear on your statement.</p></div>' : ''}
        </div>
      `;

      const customerHtmlEmail = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${siteUrl}/assets/logo/lisbonlogo.png" alt="Tuk in Lisbon" style="max-height: 50px; display: inline-block;" onerror="this.style.display='none'" />
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background-color: #ef4444; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 30px; margin-bottom: 15px;">X</div>
              <h1 style="color: #111827; margin: 0 0 10px 0; font-size: 24px;">Booking Cancelled</h1>
              <p style="color: #6b7280; margin: 0; font-size: 15px;">Hi ${booking.first_name || "Guest"}, your booking has been cancelled.</p>
              <p style="background-color: #fef2f2; display: inline-block; padding: 6px 12px; border-radius: 6px; margin-top: 15px; font-weight: bold; color: #991b1b;">Booking ID: #${booking.id}</p>
            </div>
            
            ${bookingDetailsHtml}

            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #4b5563; font-size: 15px; margin-bottom: 20px;">We're sorry to see you go! If your plans change, we'd love to show you the best of Lisbon on a future trip.</p>
              <a href="${siteUrl}/tours" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Browse Our Tours</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 14px;"><strong>Need support?</strong> Contact us at ${adminEmail}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Tuk in Lisbon. All rights reserved.</p>
          </div>
        </div>
      `;

      const adminHtmlEmail = `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 30px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="${siteUrl}/assets/logo/lisbonlogo.png" alt="Tuk in Lisbon" style="max-height: 50px; display: inline-block;" onerror="this.style.display='none'" />
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 4px solid #ef4444;">
            <h2 style="color: #111827; margin-top: 0;">Booking Cancellation Alert</h2>
            <p style="color: #6b7280;">A booking has been cancelled ${isAdmin ? 'by an Admin' : 'by the Customer'}.</p>
            <p style="background-color: #fef2f2; color: #ef4444; display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">Booking ID: #${booking.id}</p>
            
            ${bookingDetailsHtml}
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${siteUrl}/admin" style="background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Admin Dashboard</a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
            <p>&copy; ${new Date().getFullYear()} Tuk in Lisbon. All rights reserved.</p>
          </div>
        </div>
      `;

      try {
        const customerEmailReq = fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: "Tuk in Lisbon <bookings@tukinlisbon.com>",
            to: [booking.email],
            subject: `Cancellation Confirmed - ${tourName} - #${booking.id}`,
            html: customerHtmlEmail,
          })
        });

        const adminEmailReq = fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`
          },
          body: JSON.stringify({
            from: "Tuk in Lisbon <bookings@tukinlisbon.com>",
            to: [adminEmail],
            subject: `ALERT: Cancellation - ${tourName} - #${booking.id}`,
            html: adminHtmlEmail,
          })
        });

        const [customerRes, adminRes] = await Promise.all([customerEmailReq, adminEmailReq]);

        if (!customerRes.ok) {
          console.error("Failed to send customer cancellation email:", await customerRes.text());
        } else {
          console.log(`Successfully sent cancellation email to ${booking.email}`);
        }

        if (!adminRes.ok) {
          console.error("Failed to send admin cancellation email:", await adminRes.text());
        } else {
          console.log(`Successfully sent admin cancellation alert to ${adminEmail}`);
        }

      } catch (mailError) {
        console.error("Error sending cancellation emails:", mailError);
        // Don't fail the whole request because of email errors
      }
    }

    return new Response(JSON.stringify({ success: true, refunded }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("cancel-booking critical error:", err?.message || err, err?.stack || "");
    return new Response(
      JSON.stringify({ error: err?.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
