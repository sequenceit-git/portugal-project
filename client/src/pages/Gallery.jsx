import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";

const Gallery = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const { data, error } = await supabase
          .from("gallery")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error loading gallery:", error);
        } else {
          setGalleryItems(data || []);
        }
      } catch (err) {
        console.error("Failed to load gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    loadGallery();
  }, []);

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  const handleImageClick = (item) => {
    setSelectedImage(item);
    document.body.style.overflow = "hidden";
  };

  const navigateImage = (direction) => {
    const currentIndex = galleryItems.findIndex(
      (item) => item.id === selectedImage.id,
    );
    let newIndex;

    if (direction === "next") {
      newIndex =
        currentIndex === galleryItems.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex =
        currentIndex === 0 ? galleryItems.length - 1 : currentIndex - 1;
    }

    setSelectedImage(galleryItems[newIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") navigateImage("next");
      if (e.key === "ArrowLeft") navigateImage("prev");
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, galleryItems]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light flex items-center justify-center pt-24">
        <p className="text-lg text-slate-600">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light text-slate-900 font-display antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
            Guest Moments Gallery
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl">
            Explore beautiful moments captured during our tours across Portugal.
            Real moments from real travelers.
          </p>
        </div>

        {/* Masonry Grid */}
        {galleryItems.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="relative group cursor-pointer rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 break-inside-avoid mb-4"
                onClick={() => handleImageClick(item)}
              >
                {/* Image */}
                <img
                  src={item.image_url}
                  alt={item.description || item.tour_name}
                  className="w-full h-auto object-cover group-hover:scale-110 transition-transform duration-500"
                />

                {/* Tag Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wide shadow-md">
                    {item.tour_name}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-end p-4">
                  <div className="text-white text-right">
                    {item.description && (
                      <p className="text-sm leading-relaxed mb-3 text-white/90">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-white/80 text-xs">
                      <span className="material-icons text-sm">zoom_in</span>
                      <span>Click to view</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <span className="material-icons text-6xl text-slate-300 mb-4 block">
              image_not_supported
            </span>
            <p className="text-lg text-slate-500">No gallery items yet</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-50"
            aria-label="Close modal"
          >
            <span className="material-icons text-4xl">close</span>
          </button>

          {/* Main Image Container */}
          <div
            className="relative w-full h-full flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Image */}
            <div className="flex-1 flex items-center justify-center px-4">
              <img
                src={selectedImage.image_url}
                alt={selectedImage.description || selectedImage.tour_name}
                className="max-w-full max-h-full object-contain"
                draggable="false"
              />
            </div>

            {/* Left Arrow */}
            <button
              onClick={() => navigateImage("prev")}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-white hover:text-primary transition-colors z-40 p-2"
              aria-label="Previous image"
            >
              <span className="material-icons text-5xl">arrow_back_ios</span>
            </button>

            {/* Right Arrow */}
            <button
              onClick={() => navigateImage("next")}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-white hover:text-primary transition-colors z-40 p-2"
              aria-label="Next image"
            >
              <span className="material-icons text-5xl">arrow_forward_ios</span>
            </button>

            {/* Bottom Info */}
            <div className="absolute bottom-6 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-xl p-6 text-white max-w-2xl mx-auto z-40">
              <div className="mb-3">
                <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide mb-2">
                  {selectedImage.tour_name}
                </span>
              </div>
              {selectedImage.description && (
                <p className="text-sm leading-relaxed mb-3">
                  {selectedImage.description}
                </p>
              )}
              <p className="text-xs text-white/70">
                {galleryItems.findIndex(
                  (item) => item.id === selectedImage.id,
                ) + 1}{" "}
                / {galleryItems.length}
              </p>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Gallery;
