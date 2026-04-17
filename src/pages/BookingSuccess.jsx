import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import LoadingSpinner from "../components/LoadingSpinner";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [session, setSession] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      // Helper: try loading payment data (may need retries while Stripe syncs)
      const fetchPayment = async () => {
        const { data: bookingData } = await supabase
          .from("bookings")
          .select("*")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();

        if (bookingData) {
          return {
            amount: Number(bookingData.total_amount || 0),
            status: bookingData.payment_status === 'paid' ? 'paid' : bookingData.payment_status === 'failed' ? 'failed' : 'pending',
            customer_email: bookingData.email,
            customer_name: bookingData.first_name + (bookingData.last_name ? ' ' + bookingData.last_name : ''),
            booking_id: bookingData.id,
            tour_name: bookingData.tour_name,
          };
        }

        return null;
      };

      try {
        // Poll up to 5 times (Stripe Sync Engine may take a moment)
        let result = null;
        for (let attempt = 0; attempt < 5; attempt++) {
          result = await fetchPayment();
          if (result && result.status === "paid") break;
          if (result) break; // Got data but not yet "paid"
          // Wait before retrying (1s, 2s, 3s, 4s)
          if (attempt < 4) await new Promise((r) => setTimeout(r, (attempt + 1) * 1000));
        }

        if (!result) {
          console.error("Payment lookup failed after retries");
          setLoading(false);
          return;
        }

        setSession({
          amount_total: result.amount,
          status: result.status === "paid" ? "paid" : result.status,
          customer_email: result.customer_email,
          metadata: {
            customer_name: result.customer_name,
            booking_id: result.booking_id,
            tour_name: result.tour_name,
          },
        });

        // Fetch full booking details
        if (result.booking_id) {
          const { data: bookingData } = await supabase
            .from("bookings")
            .select("*")
            .eq("id", result.booking_id)
            .single();

          if (bookingData) {
            setBooking(bookingData);
          }
        }
      } catch (err) {
        console.error("Error loading payment info:", err);
      }
      setLoading(false);
    };
    load();
  }, [sessionId]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <SEO title="Booking Confirmed" description="Your Lisbon tour booking is confirmed with Tukinlisbon." noIndex={true} />
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6 py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <span className="material-icons text-green-500 text-4xl">
            check_circle
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900">
          Payment Successful!
        </h1>

        <p className="text-gray-500 max-w-md">
          Thank you
          {session?.metadata?.customer_name && (
            <>
              , <strong>{session.metadata.customer_name}</strong>
            </>
          )}
          ! Your booking
          {booking?.tour_name && (
            <>
              {" "}
              for <strong>{booking.tour_name}</strong>
            </>
          )}
          {booking?.booking_date && (
            <>
              {" "}
              on{" "}
              <strong>
                {new Date(booking.booking_date + "T00:00:00").toLocaleDateString(
                  "en-GB",
                  { day: "numeric", month: "long", year: "numeric" },
                )}
              </strong>
            </>
          )}
          {booking?.booking_time && (
            <>
              {" "}
              at <strong>{booking.booking_time}</strong>
            </>
          )}{" "}
          has been confirmed and paid.
        </p>

        {session && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full max-w-sm space-y-3">
            <div className="flex justify-between text-sm border-b border-gray-100 pb-3">
              <span className="text-gray-400">Booking ID</span>
              <span className="font-bold text-gray-900">
                #{session.metadata.booking_id}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Amount Paid</span>
              <span className="font-bold text-gray-900">
                ${session.amount_total?.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Status</span>
              <span className="inline-flex items-center gap-1 text-green-600 font-bold">
                <span className="material-icons text-xs">check_circle</span>
                Paid
              </span>
            </div>
            {session.customer_email && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Confirmation sent to</span>
                <span className="font-semibold text-gray-700">
                  {session.customer_email}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-3 mt-2">
          <Link
            to="/tours"
            className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition"
          >
            Browse More Tours
          </Link>
          <Link
            to="/"
            className="border-2 border-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Go Home
          </Link>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 mt-4">
          <span className="material-icons text-green-500 text-sm">lock</span>
          Payment processed securely via Stripe.
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingSuccess;
