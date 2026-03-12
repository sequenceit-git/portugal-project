import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

// Route-level code splitting — each page loads only when navigated to
const Home = lazy(() => import("./pages/Home.jsx"));
const Tours = lazy(() => import("./pages/Tours.jsx"));
const TourDetails = lazy(() => import("./pages/TourDetails.jsx"));
const MeetYourGuide = lazy(() => import("./pages/MeetYourGuide.jsx"));
const GuestStories = lazy(() => import("./pages/GuestStories.jsx"));
const Booking = lazy(() => import("./pages/Booking.jsx"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess.jsx"));
const BookingCancel = lazy(() => import("./pages/BookingCancel.jsx"));
const GuideMap = lazy(() => import("./pages/GuideMap.jsx"));
const Gallery = lazy(() => import("./pages/Gallery.jsx"));
const Contact = lazy(() => import("./pages/Contact.jsx"));
const Feedback = lazy(() => import("./pages/Feedback.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.jsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.jsx"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const WHATSAPP_PAGES = ["/", "/tours", "/booking"];

const WhatsAppButton = () => (
  <a
    href="https://wa.me/+351920377914"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
  >
    <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-gray-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
      Chat with us
    </span>
    <div className="w-14 h-14 rounded-full bg-[#25D366] shadow-xl shadow-green-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200">
      <svg
        viewBox="0 0 32 32"
        className="w-7 h-7 fill-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16 .5C7.44.5.5 7.44.5 16c0 2.75.72 5.37 2.08 7.67L.5 31.5l8.08-2.06A15.44 15.44 0 0016 31.5C24.56 31.5 31.5 24.56 31.5 16S24.56.5 16 .5zm0 28.2a13.2 13.2 0 01-6.73-1.84l-.48-.29-4.8 1.22 1.26-4.67-.32-.5A13.2 13.2 0 1116 28.7zm7.24-9.87c-.4-.2-2.34-1.15-2.7-1.28-.36-.13-.63-.2-.89.2s-1.02 1.28-1.25 1.55c-.23.26-.46.29-.86.1a10.83 10.83 0 01-3.19-1.97 11.97 11.97 0 01-2.21-2.75c-.23-.4-.02-.61.17-.81.18-.18.4-.46.6-.69.2-.23.26-.4.4-.66.13-.26.06-.49-.03-.69-.1-.2-.89-2.14-1.22-2.93-.32-.77-.65-.66-.89-.67h-.76c-.26 0-.69.1-1.05.49s-1.38 1.35-1.38 3.29 1.41 3.82 1.61 4.08c.2.26 2.78 4.25 6.73 5.96.94.41 1.67.65 2.24.83.94.3 1.8.26 2.47.16.75-.11 2.34-.96 2.67-1.88.33-.92.33-1.71.23-1.88-.1-.16-.36-.26-.76-.46z" />
      </svg>
    </div>
  </a>
);

const App = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isHome = location.pathname === "/";
  const isTourDetails = location.pathname.startsWith("/tour-details/");
  const showWhatsApp =
    WHATSAPP_PAGES.includes(location.pathname) || isTourDetails;

  return (
    <div className="min-h-screen text-slate-900">
      {!isAdmin && <Navbar />}
      <main className={isAdmin ? "" : "pt-16"}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<Tours />} />
            <Route path="/tour-details/:id" element={<TourDetails />} />
            <Route path="/meet-your-guide" element={<MeetYourGuide />} />
            <Route path="/guest-stories" element={<GuestStories />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/booking/cancel" element={<BookingCancel />} />
            <Route path="/map" element={<GuideMap />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {showWhatsApp && <WhatsAppButton />}
    </div>
  );
};

export default App;
