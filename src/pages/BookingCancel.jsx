import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const BookingCancel = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);
  const cancelledRef = useRef(false); // prevent double-cancel

  // Auto-cancel the abandoned booking so it frees up capacity
  useEffect(() => {
    if (!bookingId || cancelledRef.current) return;
    cancelledRef.current = true;

    const cancelBooking = async () => {
      setCancelling(true);
      try {
        // Cancel via RPC (SECURITY DEFINER — only cancels pending/unpaid)
        const { data, error } = await supabase.rpc(
          "fn_cancel_abandoned_booking",
          { p_booking_id: parseInt(bookingId) },
        );

        if (!error && data === true) setCancelled(true);
      } catch (err) {
        console.error("Could not cancel booking:", err);
      } finally {
        setCancelling(false);
      }
    };

    cancelBooking();
  }, [bookingId]);

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      <SEO title="Booking Cancelled" description="Your booking has been cancelled." noIndex={true} />
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center gap-6 py-16">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center">
          <span className="material-icons text-amber-500 text-4xl">
            info
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900">
          Payment Cancelled
        </h1>

        <p className="text-gray-500 max-w-md">
          {cancelling
            ? "Releasing your booking..."
            : cancelled
              ? "Your booking has been cancelled and the spot has been freed up. You can rebook anytime."
              : "Your payment was not completed. No charges were made."}
        </p>

        <div className="flex gap-3 mt-2">
          <Link
            to="/tours"
            className="bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition"
          >
            Back to Tours
          </Link>
          <Link
            to="/contact"
            className="border-2 border-gray-200 text-gray-700 font-bold px-8 py-3 rounded-xl hover:bg-gray-50 transition"
          >
            Contact Us
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BookingCancel;
