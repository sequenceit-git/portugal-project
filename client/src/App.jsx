import { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

// Route-level code splitting — each page loads only when navigated to
const Home         = lazy(() => import("./pages/Home.jsx"));
const Tours        = lazy(() => import("./pages/Tours.jsx"));
const TourDetails  = lazy(() => import("./pages/TourDetails.jsx"));
const MeetYourGuide = lazy(() => import("./pages/MeetYourGuide.jsx"));
const GuestStories = lazy(() => import("./pages/GuestStories.jsx"));
const Booking      = lazy(() => import("./pages/Booking.jsx"));
const BookingSuccess = lazy(() => import("./pages/BookingSuccess.jsx"));
const BookingCancel  = lazy(() => import("./pages/BookingCancel.jsx"));
const GuideMap     = lazy(() => import("./pages/GuideMap.jsx"));
const Gallery      = lazy(() => import("./pages/Gallery.jsx"));
const Contact      = lazy(() => import("./pages/Contact.jsx"));
const Feedback     = lazy(() => import("./pages/Feedback.jsx"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard.jsx"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <span className="material-icons animate-spin text-primary text-4xl">sync</span>
  </div>
);

const App = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isHome = location.pathname === "/";
  const isTourDetails = location.pathname.startsWith("/tour-details/");

  return (
    <div className="min-h-screen text-slate-900">
      {!isAdmin && <Navbar />}
      <main className={isAdmin || isHome || isTourDetails ? "" : "pt-24"}>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

export default App;
