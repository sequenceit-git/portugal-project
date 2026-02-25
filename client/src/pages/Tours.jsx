import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import TourCard from "../components/TourCard";
import TourPreviewPopup from "../components/TourPreviewPopup";
import Footer from "../components/Footer";

const Tours = () => {
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  useEffect(() => {
    const loadTours = async () => {
      const { data, error } = await supabase
        .from("tours")
        .select(
          "id,name,category,duration,people,gallery,details,rating,review_count,activity,journey,price,title_image",
        );
      if (error) {
        console.error("failed to fetch tours", error);
        return;
      }
      setTours(data);
    };

    loadTours();
  }, []);

  const handlePreviewClick = (tour) => {
    setSelectedTour(tour);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedTour(null);
  };

  return (
    <div className="bg-background-light min-h-screen text-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8">All Tours</h1>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onPreviewClick={handlePreviewClick}
            />
          ))}
        </div>
      </div>
      <TourPreviewPopup
        tour={selectedTour}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />
      <Footer />
    </div>
  );
};

export default Tours;
