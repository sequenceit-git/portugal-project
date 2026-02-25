import { useRef } from "react";

const GalleryScroller = ({ images }) => {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollBy({
        left: direction === "left" ? -width : width,
        behavior: "smooth",
      });
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
          <img
            key={idx}
            src={url}
            alt={`gallery ${idx + 1}`}
            className="min-w-[85%] md:min-w-[400px] rounded-2xl object-cover h-64"
          />
        ))}
      </div>
    </div>
  );
};

export default GalleryScroller;
