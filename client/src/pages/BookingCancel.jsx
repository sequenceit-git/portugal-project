import { useSearchParams, Link } from "react-router-dom";
import Footer from "../components/Footer";

const BookingCancel = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("booking_id");

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
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
          Your payment was not completed. Don't worry — your booking
          {bookingId && <> (#{bookingId})</>} has been saved as pending. You can
          try again or contact us for help.
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
