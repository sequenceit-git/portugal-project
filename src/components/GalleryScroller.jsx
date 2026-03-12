import { useRef, useState, useEffect } from "react";

const GalleryScroller = ({ images }) => {
  const containerRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [dragStart, setDragStart] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const scroll = (direction) => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollBy({
        left: direction === "left" ? -width : width,
        behavior: "smooth",
      });
    }
  };

  const openModal = (index) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "unset";
  };

  const navigateImage = (direction) => {
    if (direction === "next") {
      setCurrentImageIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1,
      );
    } else {
      setCurrentImageIndex((prev) =>
        prev === 0 ? images.length - 1 : prev - 1,
      );
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") navigateImage("next");
      if (e.key === "ArrowLeft") navigateImage("prev");
      if (e.key === "Escape") closeModal();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, images.length]);

  // Handle drag/swipe
  const handleMouseDown = (e) => {
    setDragStart(e.clientX);
    setIsDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
  };

  const handleMouseUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);

    const dragEnd = e.clientX;
    const dragDistance = dragStart - dragEnd;

    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0) {
        navigateImage("next");
      } else {
        navigateImage("prev");
      }
    }
  };

  // Handle touch events for mobile
  const handleTouchStart = (e) => {
    setDragStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e) => {
    const dragEnd = e.changedTouches[0].clientX;
    const dragDistance = dragStart - dragEnd;

    if (Math.abs(dragDistance) > 50) {
      if (dragDistance > 0) {
        navigateImage("next");
      } else {
        navigateImage("prev");
      }
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Gallery</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors bg-white"
          >
            <span className="material-icons">arrow_back</span>
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30"
          >
            <span className="material-icons">arrow_forward</span>
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0"
      >
        {images.map((url, idx) => (
          <div
            key={idx}
            className="relative min-w-[85%] md:min-w-[400px] rounded-2xl overflow-hidden group cursor-pointer flex-shrink-0"
            onClick={() => openModal(idx)}
          >
            <img
              src={url}
              alt={`gallery ${idx + 1}`}
              className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button className="bg-white text-slate-900 font-bold px-6 py-3 rounded-full shadow-lg hover:bg-slate-100 transition-colors flex items-center gap-2">
                <span className="material-icons">zoom_in</span>
                View Gallery
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={closeModal}
        >
          <button
            onClick={closeModal}
            className="absolute top-6 right-6 text-white hover:text-primary transition-colors z-50"
            aria-label="Close modal"
          >
            <span className="material-icons text-4xl">close</span>
          </button>

          {/* Main Image Container */}
          <div
            className="relative w-full h-full flex items-center justify-center overflow-hidden"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentImageIndex]}
              alt={`Full view ${currentImageIndex + 1}`}
              className={`max-w-full max-h-full object-contain transition-opacity ${
                isDragging ? "cursor-grabbing" : "cursor-grab"
              }`}
              draggable="false"
            />

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
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white text-center z-40">
              <p className="text-lg font-semibold">
                {currentImageIndex + 1} / {images.length}
              </p>
              <p className="text-sm text-white/70 mt-1">
                Use arrow keys or drag to navigate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryScroller;
