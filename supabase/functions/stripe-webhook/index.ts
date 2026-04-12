// supabase/functions/stripe-webhook/index.ts
// Deno Edge Function — handles Stripe webhook events

import Stripe from "https://esm.sh/stripe@14.25.0?target=denonext";
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

    // Handle immediate and async successful checkout completion
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const sessionId = session.id;
      const isFullyPaid = session.payment_status === "paid";

      console.log(
        `Checkout completed for booking ${bookingId}, session ${sessionId}, payment_status=${session.payment_status}`,
      );

      if (!isFullyPaid) {
        // Fully automated flow: if checkout completed without payment, cancel the booking.
        const cancelUpdate = {
          payment_status: "failed",
          status: "cancelled",
        };

        if (sessionId) {
          await supabase
            .from("bookings")
            .update(cancelUpdate)
            .eq("stripe_session_id", sessionId)
            .neq("status", "cancelled");
        }

        if (bookingId) {
          await supabase
            .from("bookings")
            .update(cancelUpdate)
            .eq("id", parseInt(bookingId))
            .neq("status", "cancelled");
        }

        console.log(
          `Auto-cancelled booking ${bookingId || "(session lookup)"}: checkout completed but payment not received`,
        );

        return new Response(JSON.stringify({ received: true, autoCancelled: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update booking status using stripe_session_id
      const { error: sessionUpdateError } = await supabase
        .from("bookings")
        .update({
          payment_status: "paid",
          status: "confirmed",
        })
        .eq("stripe_session_id", sessionId)
        .neq("status", "cancelled");

      if (sessionUpdateError) {
        console.error("Failed to update booking via session_id:", sessionUpdateError);
      }

      // Update booking status using explicit bookingId (fallback)
      if (bookingId) {
        const { error: idUpdateError } = await supabase
          .from("bookings")
          .update({
            status: "confirmed",
            payment_status: "paid",
          })
          .eq("id", parseInt(bookingId))
          .neq("status", "cancelled");
        if (idUpdateError) {
          console.error("Failed to update booking via bookingId:", idUpdateError);
        }
      }

      // Now fetch receipt URL safely without risking the whole webhook if the field is missing
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
              // Ignore errors if the newly-added DB column doesn't exist yet
              await supabase
                .from("bookings")
                .update({ receipt_url: charge.receipt_url })
                .eq("stripe_session_id", sessionId);
            }
          }
        } catch (e) {
          console.error("Could not fetch receipt URL:", e);
        }
      }

      // Fetch full booking details to generate invoice PDF and send email
      try {
        const bookingLookupId = bookingId ? parseInt(bookingId) : NaN;
        let bookingQuery = supabase
          .from("bookings")
          .select("*, tours(duration)");

        if (Number.isFinite(bookingLookupId)) {
          bookingQuery = bookingQuery.eq("id", bookingLookupId);
        } else {
          bookingQuery = bookingQuery.eq("stripe_session_id", sessionId);
        }

        const { data: b } = await bookingQuery.single();

          if (b && b.email) {
            // Initialize MEETING POINTS
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

            const mp = MEETING_POINTS.find(m => m.name === b.meeting_point) || MEETING_POINTS[0];
            const tourDuration = b.tours?.duration || "N/A";
            const bookingDateStr = new Date(b.created_at || new Date()).toLocaleString();
            const customerName = `${b.first_name} ${b.last_name || ""}`.trim();
            const tourName = b.tour_name || "Tour";
            const adminEmail = "tukinlisbon2@gmail.com";

            // 1. Generate PDF Invoice
            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([600, 800]);
            const fontReg = await pdfDoc.embedFont(StandardFonts.Helvetica);
            const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
            
            page.drawText("BOOKING INVOICE", { x: 50, y: 730, size: 24, font: fontBold, color: rgb(0.1, 0.1, 0.1) });
            page.drawText(`Booking ID: #${b.id}`, { x: 50, y: 690, size: 12, font: fontReg });
            page.drawText(`Date Issued: ${new Date().toLocaleDateString()}`, { x: 350, y: 690, size: 12, font: fontReg });
            
            page.drawText("Billed To:", { x: 50, y: 650, size: 14, font: fontBold });
            page.drawText(customerName, { x: 50, y: 630, size: 12, font: fontReg });
            page.drawText(`Email: ${b.email}`, { x: 50, y: 610, size: 12, font: fontReg });
            if (b.phone) page.drawText(`Phone: ${b.phone}`, { x: 50, y: 590, size: 12, font: fontReg });
            
            page.drawText("Tour Details:", { x: 50, y: 550, size: 14, font: fontBold });
            page.drawText(`Tour Name: ${tourName}`, { x: 50, y: 530, size: 12, font: fontReg });
            page.drawText(`Date & Time: ${b.booking_date} at ${b.booking_time}`, { x: 50, y: 510, size: 12, font: fontReg });
            page.drawText(`Total Guests: ${b.total_guests}`, { x: 50, y: 490, size: 12, font: fontReg });
            page.drawText(`Language: ${b.language}`, { x: 50, y: 470, size: 12, font: fontReg });

            page.drawText("Payment Summary:", { x: 50, y: 430, size: 14, font: fontBold });
            page.drawText(`Total Amount Paid: €${Number(b.total_amount || 0).toFixed(2)} EUR`, { x: 50, y: 410, size: 16, font: fontBold, color: rgb(0.1, 0.6, 0.2) });

            page.drawText("Thank you for choosing Tuk in Lisbon!", { x: 50, y: 350, size: 12, font: fontReg, color: rgb(0.4, 0.4, 0.4) });

            const pdfBytes = await pdfDoc.save();
            const pdfBase64 = encodeBase64(pdfBytes);

            // 2. Send Emails using Resend
            const resendKey = Deno.env.get("RESEND_API_KEY") || Deno.env.get("Resend_API_Key");
            if (resendKey) {

              const bookingDetailsHtml = `
                  <div style="background-color: #ffffff; border-radius: 12px; margin: 20px 0; padding: 25px; border: 1px solid #f0f0f0; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                    <h3 style="margin-top: 0; color: #ea580c; font-size: 18px; border-bottom: 2px solid #fff7ed; padding-bottom: 10px;">Guest Information</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280; width: 40%;"><strong>Name:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${customerName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Email:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${b.email}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Phone:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${b.phone || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Travelers:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${b.total_guests} Guest(s)</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Language:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${b.language || "Not specified"}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Amount Paid:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #10b981; font-weight: bold;">€${Number(b.total_amount || 0).toFixed(2)}</td>
                      </tr>
                    </table>

                    <h3 style="margin-top: 0; color: #ea580c; font-size: 18px; border-bottom: 2px solid #fff7ed; padding-bottom: 10px;">Tour Information</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280; width: 40%;"><strong>Tour Name:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827; font-weight: bold;">${tourName}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Duration:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${tourDuration}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Date:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${b.booking_date}</td>
                      </tr>
                      <tr>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #6b7280;"><strong>Time:</strong></td>
                        <td style="padding: 8px 0; border-bottom: 1px solid #f9fafb; color: #111827;">${b.booking_time}</td>
                      </tr>
                    </table>

                    <h3 style="margin-top: 0; color: #ea580c; font-size: 18px; border-bottom: 2px solid #fff7ed; padding-bottom: 10px;">Meeting Point Details</h3>
                    <div style="background-color: #fff7ed; padding: 15px; border-radius: 8px; border-left: 4px solid #ea580c; margin-bottom: 15px;">
                      <p style="margin: 0 0 5px 0; color: #111827; font-weight: bold;">${mp.name}</p>
                      <p style="margin: 0 0 10px 0; color: #4b5563; font-size: 14px;">${mp.note}</p>
                      <a href="${mp.url}" target="_blank" style="display: inline-block; background-color: #ea580c; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: bold;">View on Google Maps</a>
                    </div>
                  </div>
              `;

              const customerHtmlEmail = `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 30px; border-radius: 12px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/assets/logo/lisbonlogo.png" alt="Tuk in Lisbon" style="max-height: 50px; display: inline-block;" onerror="this.style.display='none'" />
                  </div>
                  
                  <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 30px;">
                      <div style="display: inline-block; background-color: #10b981; color: #ffffff; width: 60px; height: 60px; border-radius: 50%; line-height: 60px; font-size: 30px; margin-bottom: 15px;">✓</div>
                      <h1 style="color: #111827; margin: 0 0 10px 0; font-size: 24px;">Booking Confirmed!</h1>
                      <p style="color: #6b7280; margin: 0; font-size: 15px;">Hi ${b.first_name}, your tour is fully confirmed.</p>
                      <p style="background-color: #f3f4f6; display: inline-block; padding: 6px 12px; border-radius: 6px; margin-top: 15px; font-weight: bold; color: #374151;">Booking ID: #${b.id}</p>
                    </div>
                    
                    ${bookingDetailsHtml}

                    <div style="text-align: center; margin-top: 30px;">
                      <p style="color: #4b5563; font-size: 15px; margin-bottom: 20px;">We've attached your official invoice as a PDF to this email.<br>We look forward to seeing you soon!</p>
                      <p style="color: #9ca3af; font-size: 14px;"><strong>Need support?</strong> Contact us at ${adminEmail}</p>
                    </div>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p style="color: #6b7280; font-size: 14px; margin-bottom: 15px;">Need to cancel? You can cancel for free up to 24 hours before your tour starts.</p>
                    <a href="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/cancel-tour?booking_id=${b.id}" style="color: #ef4444; font-size: 14px; font-weight: bold; text-decoration: underline;">Cancel your tour here</a>
                  </div>
                  
                  <div style="text-align: center; margin-top: 30px; color: #9ca3af; font-size: 12px;">
                    <p>&copy; ${new Date().getFullYear()} Tuk in Lisbon. All rights reserved.</p>
                  </div>
                </div>
              `;

              const adminHtmlEmail = `
                <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 30px; border-radius: 12px;">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <img src="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/assets/logo/lisbonlogo.png" alt="Tuk in Lisbon" style="max-height: 50px; display: inline-block;" onerror="this.style.display='none'" />
                  </div>
                  
                  <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 4px solid #ea580c;">
                    <h2 style="color: #111827; margin-top: 0;">New Booking Alert</h2>
                    <p style="color: #6b7280;">A new booking has just been confirmed via Stripe payment.</p>
                    <p style="background-color: #fff7ed; color: #ea580c; display: inline-block; padding: 6px 12px; border-radius: 6px; font-weight: bold; margin-bottom: 20px;">Booking ID: #${b.id}</p>
                    
                    ${bookingDetailsHtml}
                    
                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/admin" style="background-color: #111827; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Admin Dashboard</a>
                    </div>
                  </div>
                </div>
              `;

              const customerEmailReq = fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${resendKey}`
                },
                body: JSON.stringify({
                  from: "Tuk in Lisbon <bookings@tukinlisbon.com>",
                  to: [b.email],
                  subject: `Booking Confirmation & Invoice - ${tourName}`,
                  html: customerHtmlEmail,
                  attachments: [
                    {
                      filename: `invoice-${b.id}.pdf`,
                      content: pdfBase64
                    }
                  ]
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
                  subject: `New Booking Confirmed: ${tourName} - #${b.id}`,
                  html: adminHtmlEmail
                })
              });

              const [customerRes, adminRes] = await Promise.all([customerEmailReq, adminEmailReq]);

              if (!customerRes.ok) {
                console.error("Failed to send customer email via Resend:", await customerRes.text());
              } else {
                console.log(`Successfully sent confirmation email to ${b.email}`);
              }

              if (!adminRes.ok) {
                console.error("Failed to send admin email via Resend:", await adminRes.text());
              } else {
                console.log(`Successfully sent admin notification email to ${adminEmail}`);
              }

            } else {
              console.log("RESEND_API_KEY not configured. Skipping email delivery.");
            }
          }
        } catch (mailError) {
          console.error("Error generating invoice / sending email:", mailError);
        }
      }

    // Handle checkout.session.expired (mark as failed)
    if (event.type === "checkout.session.expired") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const sessionId = session.id;

      console.log(`Checkout expired for booking ${bookingId}, session ${sessionId}`);

      // Cancel via stripe_session_id
      if (sessionId) {
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
            payment_status: "expired",
          })
          .eq("stripe_session_id", sessionId)
          .in("status", ["pending"]);
      }

      // Cancel via bookingId (fallback)
      if (bookingId) {
        await supabase
          .from("bookings")
          .update({
            status: "cancelled",
            payment_status: "expired",
          })
          .eq("id", parseInt(bookingId))
          .in("status", ["pending"]);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Critical Webhook Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
