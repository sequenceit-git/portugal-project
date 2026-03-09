import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import TourDetails from "./pages/TourDetails.jsx";
import Tours from "./pages/Tours.jsx";
import MeetYourGuide from "./pages/MeetYourGuide.jsx";
import GuestStories from "./pages/GuestStories.jsx";
import Booking from "./pages/Booking.jsx";
import BookingSuccess from "./pages/BookingSuccess.jsx";
import BookingCancel from "./pages/BookingCancel.jsx";
import GuideMap from "./pages/GuideMap.jsx";
import Gallery from "./pages/Gallery.jsx";
import Contact from "./pages/Contact.jsx";
import Feedback from "./pages/Feedback.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

const App = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isHome = location.pathname === "/";
  const isTourDetails = location.pathname.startsWith("/tour-details/");

  return (
    <div className="min-h-screen text-slate-900">
      {!isAdmin && <Navbar />}
      <main className={isAdmin || isHome || isTourDetails ? "" : "pt-24"}>
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
      </main>
    </div>
  );
};

export default App;
