import { useSearchParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";
import SEO from "../components/SEO";
import LoadingSpinner from "../components/LoadingSpinner";

const cancellationReasons = [
  "Schedule conflict",
  "Change of travel plans",
  "Pricing issue",
  "Found a different tour",
  "Other"
];

const CancelTour = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedReason, setSelectedReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setError("No booking ID provided.");
      setLoading(false);
      return;
    }

    const fetchBooking = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from("bookings")
          .select("id, tour_name, booking_date, booking_time, status")
          .eq("id", parseInt(bookingId))
          .single();

        if (fetchError || !data) {
          setError("Booking not found.");
        } else {
          setBooking(data);
          if (data.status === "cancelled") {
            setError("This booking has already been cancelled.");
          } else {
            // Check 24-hour validation client-side as well
            const tourDateTime = new Date(`${data.booking_date}T${data.booking_time}:00`);
            const now = new Date();
            const hoursDifference = (tourDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

            if (hoursDifference < 24) {
              setError("Cancellations are only allowed up to 24 hours before the tour start time.");
            }
          }
        }
      } catch (err) {
        setError("Error loading booking details.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReason) {
      alert("Please select a reason for cancellation.");
      return;
    }

    if (selectedReason === "Other" && !otherReason.trim()) {
      alert("Please provide a reason.");
      return;
    }

    const finalReason = selectedReason === "Other" ? `Other: ${otherReason}` : selectedReason;

    setIsSubmitting(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke("cancel-booking", {
        body: { bookingId: parseInt(bookingId), reason: finalReason }
      });

      if (fnError) {
        throw new Error(fnError.message);
      }
      
      if (data.error) {
         throw new Error(data.error);
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      let errMsg = "An error occurred while cancelling your booking.";
      if (err.context && err.context.json && err.context.json().error) {
         // Some edge function errors can be fetched this way if wrapped properly,
         // but err.message usually has it handled by Supabase JS client.
      }
      alert(err.message || errMsg);
      
      // Update check if it was cancelled
      if (err.message && err.message.includes("24 hours")) {
         setError(err.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col pt-16">
      <SEO title="Cancel Tour" description="Cancel your Tuk in Lisbon tour booking." noIndex={true} />
      
      <div className="flex-1 flex flex-col items-center px-4 py-12 md:py-20 max-w-2xl mx-auto w-full">
        {success ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center w-full">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-icons text-green-500 text-4xl">check_circle</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Tour Cancelled</h1>
            <p className="text-gray-600 mb-8">
              Your cancellation request has been processed successfully. 
              A refund has been issued to your original payment method and should appear on your statement in 5-10 business days.
            </p>
            <Link
              to="/"
              className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition"
            >
              Return Home
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl w-full p-6 md:p-10 border border-gray-100">
            <h1 className="text-3xl font-extrabold text-[#221610] mb-2 tracking-tight">Cancel Tour</h1>
            
            {error ? (
              <div className="mt-6 text-center">
                <div className="bg-red-50 text-red-700 p-4 rounded-xl text-left border border-red-100 mb-6">
                  <span className="font-bold block mb-1">Cancellation Unavailable</span>
                  {error}
                </div>
                <Link
                  to="/"
                  className="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition"
                >
                  Return Home
                </Link>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 rounded-xl p-5 mb-8 border border-gray-100 text-sm">
                  <p className="mb-2"><span className="font-semibold text-gray-700">Tour:</span> {booking?.tour_name}</p>
                  <p className="mb-2"><span className="font-semibold text-gray-700">Date:</span> {booking?.booking_date}</p>
                  <p><span className="font-semibold text-gray-700">Time:</span> {booking?.booking_time}</p>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-amber-700 bg-amber-50 p-3 rounded-lg flex items-start gap-2">
                       <span className="material-icons text-lg">info</span>
                       <span>Cancellations are only permitted <strong>24 hours</strong> before the start time. A full refund will be sent to the original payment method upon cancellation.</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-gray-800 font-semibold mb-4">
                      Please let us know why you are cancelling:
                    </label>
                    <div className="space-y-3">
                      {cancellationReasons.map((reason) => (
                        <label key={reason} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
                          <input
                            type="radio"
                            name="cancelReason"
                            value={reason}
                            checked={selectedReason === reason}
                            onChange={(e) => setSelectedReason(e.target.value)}
                            className="w-5 h-5 text-primary focus:ring-primary border-gray-300"
                          />
                          <span className="text-gray-700">{reason}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedReason === "Other" && (
                    <div className="animate-fade-in">
                      <label className="block text-gray-700 font-semibold mb-2">
                        Please specify:
                      </label>
                      <textarea
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        className="w-full sm:text-sm pt-4 pb-2 px-4 rounded-xl border border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all bg-white min-h-[100px] resize-none"
                        placeholder="Tell us a bit more..."
                        required
                      />
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
                    <Link
                      to="/"
                      className="px-6 py-3 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition text-center"
                    >
                      Keep Booking
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting || !selectedReason}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Confirm Cancellation"
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default CancelTour;
