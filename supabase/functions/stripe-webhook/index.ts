// supabase/functions/stripe-webhook/index.ts
// Deno Edge Function — handles Stripe webhook events

import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1?target=deno";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

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

      // Fetch full booking details to generate invoice PDF and send email
      if (bookingId) {
        try {
          const { data: b } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", parseInt(bookingId))
            .single();

          if (b && b.email) {
            // 1. Generate PDF Invoice
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 800]);
            const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            page.drawText("BOOKING INVOICE", { x: 50, y: 730, size: 24, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
            page.drawText(`Booking ID: #${b.id}`, { x: 50, y: 690, size: 12, font: fontReg });
            page.drawText(`Date Issued: ${new Date().toLocaleDateString()}`, { x: 350, y: 690, size: 12, font: fontReg });
            
            page.drawText("Billed To:", { x: 50, y: 650, size: 14, font: fontBold });
            page.drawText(`${b.first_name} ${b.last_name}`, { x: 50, y: 630, size: 12, font: fontReg });
            page.drawText(`Email: ${b.email}`, { x: 50, y: 610, size: 12, font: fontReg });
            if (b.phone) page.drawText(`Phone: ${b.phone}`, { x: 50, y: 590, size: 12, font: fontReg });
            
            page.drawText("Tour Details:", { x: 50, y: 550, size: 14, font: fontBold });
            page.drawText(`Tour Name: ${b.tour_name || "Custom Tour"}`, { x: 50, y: 530, size: 12, font: fontReg });
            page.drawText(`Date & Time: ${b.booking_date} at ${b.booking_time}`, { x: 50, y: 510, size: 12, font: fontReg });
            page.drawText(`Total Guests: ${b.total_guests}`, { x: 50, y: 490, size: 12, font: fontReg });
            page.drawText(`Language: ${b.language}`, { x: 50, y: 470, size: 12, font: fontReg });

            page.drawText("Payment Summary:", { x: 50, y: 430, size: 14, font: fontBold });
            page.drawText(`Total Amount Paid: $${Number(b.total_amount || 0).toFixed(2)} USD`, { x: 50, y: 410, size: 16, font: fontBold, color: rgb(0.1, 0.6, 0.2) });

            page.drawText("Thank you for choosing Tuk in Lisbon!", { x: 50, y: 350, size: 12, font: fontReg, color: rgb(0.4, 0.4, 0.4) });

            const pdfBytes = await pdfDoc.save();
            const pdfBase64 = encodeBase64(pdfBytes);

            // 2. Send Email using Resend
            const resendKey = Deno.env.get("RESEND_API_KEY");
            if (resendKey) {
              const htmlEmail = `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #374151;">
                  <h2 style="color: #ea580c;">Booking Confirmed!</h2>
                  <p>Hi ${b.first_name},</p>
                  <p>Your payment was successful and your tour is fully confirmed.</p>
                  <p><strong>Your Booking ID is: #${b.id}</strong></p>
                  <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f3f4f6;">
                    <p style="margin: 0 0 10px 0;"><strong>Tour:</strong> ${b.tour_name}</p>
                    <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${b.booking_date}</p>
                    <p style="margin: 0;"><strong>Time:</strong> ${b.booking_time}</p>
                  </div>
                  <p>Please find your official invoice attached as a PDF to this email.</p>
                  <p>We look forward to seeing you soon!</p>
                  
                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="margin-bottom: 20px;">Need to cancel? You can cancel for free up to 24 hours before your tour starts.</p>
                    <a href="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/cancel-tour?booking_id=${b.id}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Cancel Tour</a>
                  </div>
                  <br/>
                  <p style="color: #9ca3af; font-size: 12px;">The Tuk in Lisbon Team</p>
                </div>
              `;

              const emailReq = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${resendKey}`
                },
                body: JSON.stringify({
                  from: "Tuk in Lisbon <bookings@tukinlisbon.com>",
                  to: [b.email],
                  subject: `Booking Confirmation & Invoice - ${b.tour_name || "Tour"}`,
                  html: htmlEmail,
                  attachments: [
                    {
                      filename: `invoice-${b.id}.pdf`,
                      content: pdfBase64
                    }
                  ]
                })
              });

              if (!emailReq.ok) {
                const text = await emailReq.text();
                console.error("Failed to send email via Resend:", text);
              } else {
                console.log(`Successfully sent confirmation email to ${b.email}`);
              }
            } else {
              console.log("RESEND_API_KEY not configured. Skipping email delivery.");
            }
          }
        } catch (mailError) {
          console.error("Error generating invoice / sending email:", mailError);
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
