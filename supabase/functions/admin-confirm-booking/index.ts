import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1?target=deno";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId } = await req.json();

    if (!bookingId) {
      throw new Error("bookingId is required");
    }

    console.log(`Manually confirming booking ${bookingId}`);

    // Update booking status in the database first
    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status: "confirmed" })
      .eq("id", parseInt(bookingId));

    if (updateError) {
      throw new Error(`Failed to update booking status: ${updateError.message}`);
    }

    // Fetch full booking details to generate invoice PDF and send email
    const { data: b, error: fetchError } = await supabase
      .from("bookings")
      .select("*, tours(duration)")
      .eq("id", parseInt(bookingId))
      .single();

    if (fetchError || !b) {
      throw new Error(`Booking not found after update: ${fetchError?.message}`);
    }

    if (b.email) {
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
      page.drawText(`Total Amount: €${Number(b.total_amount || 0).toFixed(2)} EUR`, { x: 50, y: 410, size: 16, font: fontBold, color: rgb(0.1, 0.6, 0.2) });

      page.drawText("Thank you for choosing Tuk in Lisbon!", { x: 50, y: 350, size: 12, font: fontReg, color: rgb(0.4, 0.4, 0.4) });

      const pdfBytes = await pdfDoc.save();
      const pdfBase64 = encodeBase64(pdfBytes);

      // 2. Send Emails using Resend
      const resendKey = Deno.env.get("RESEND_API_KEY");
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
              <img src="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/assets/logo/logo.png" alt="Tuk in Lisbon" style="max-height: 50px; display: inline-block;" onerror="this.style.display='none'" />
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
              <img src="${Deno.env.get("SITE_URL") || "https://tukinlisbon.com"}/assets/logo/logo.png" alt="Tuk in Lisbon" style="max-height: 50px; display: inline-block;" onerror="this.style.display='none'" />
            </div>
            
            <div style="background-color: #ffffff; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border-top: 4px solid #ea580c;">
              <h2 style="color: #111827; margin-top: 0;">Manual Admin Confirmation</h2>
              <p style="color: #6b7280;">A booking has just been manually confirmed via the Admin Dashboard.</p>
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
            subject: `Manual Confirmation: ${tourName} - #${b.id}`,
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
          console.log(`Successfully sent admin email for booking #${b.id}`);
        }
      } else {
        console.warn("RESEND_API_KEY is not set. Skipping emails.");
      }
    }

    return new Response(JSON.stringify({ success: true, bookingId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Admin Confirm Booking Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});