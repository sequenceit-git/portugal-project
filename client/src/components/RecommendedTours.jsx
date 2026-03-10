import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

/* ── Skeleton loading card ──────────────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100 animate-pulse flex-shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-10px)]">
    <div className="h-48 bg-gray-200" />
    <div className="p-4 space-y-2.5">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-5 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  </div>
);

/* ── Tour Card for Recommendations ─────────────────────────── */
const RecommendedTourCard = ({ tour }) => (
  <Link
    to={`/tour-details/${tour.id}`}
    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer flex flex-col bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(33.333%-10px)]"
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      <img
        src={tour.title_image}
        alt={tour.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        decoding="async"
        width="480"
        height="192"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Rating pill on image */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-semibold">
        <span className="material-icons text-yellow-400 text-sm">star</span>
        {Number(tour.rating).toFixed(1)}
        <span className="text-white/70">({tour.review_count})</span>
      </div>

      {/* Price pill on image */}
      {tour.price && (
        <div className="absolute bottom-3 right-3 bg-primary text-white px-2.5 py-1 rounded-full text-[10px] font-extrabold">
          From €{Number(tour.price).toFixed(0)}/person
        </div>
      )}
    </div>

    {/* Body */}
    <div className="flex flex-col flex-1 p-4">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-xs text-gray-500 mb-2">
        <span className="flex items-center gap-1">
          <span className="material-icons text-primary text-sm">schedule</span>
          {tour.duration} {tour.duration === 1 ? "Hour" : "Hours"}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-icons text-primary text-sm">groups</span>
          Up to {tour.people}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-extrabold text-gray-900 mb-2 leading-snug line-clamp-2">
        {tour.name}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-xs leading-relaxed flex-1 mb-3 line-clamp-2">
        {tour.details}
      </p>

      {/* CTA Button */}
      <div>
        <button className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm px-3 py-2 rounded-lg transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5">
          View Tour
          <span className="material-icons text-base">arrow_forward</span>
        </button>
      </div>
    </div>
  </Link>
);

/* ── Recommended Tours Carousel Component ────────────────────────────── */
const RecommendedTours = ({ currentTourId, limit = 6 }) => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadTours = async () => {
      const { data, error } = await supabase
        .from("tours")
        .select(
          "id,name,category,duration,people,guide_language,details,activity,rating,review_count,price,title_image",
        )
        .neq("id", currentTourId)
        .order("created_at", { ascending: true })
        .limit(limit);

      if (error) {
        console.error("Failed to fetch recommended tours:", error);
      } else {
        setTours(data || []);
      }
      setLoading(false);
    };
    loadTours();
  }, [currentTourId, limit]);

  const scroll = (direction) => {
    if (containerRef.current) {
      const width = containerRef.current.clientWidth;
      containerRef.current.scrollBy({
        left: direction === "left" ? -width : width,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="py-10 sm:py-12 lg:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              You might also like
            </h2>
            <div className="flex gap-2">
              <button
                disabled
                className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-300 bg-white"
              >
                <span className="material-icons">arrow_back</span>
              </button>
              <button
                disabled
                className="w-10 h-10 rounded-full bg-gray-300 text-white flex items-center justify-center"
              >
                <span className="material-icons">arrow_forward</span>
              </button>
            </div>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </section>
    );
  }

  if (tours.length === 0) {
    return null;
  }

  return (
    <section className="py-10 sm:py-12 lg:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">
              You might also like
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Explore other amazing tuk-tuk experiences in Lisbon
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors bg-white shadow-md"
            >
              <span className="material-icons">arrow_back</span>
            </button>
            <button
              onClick={() => scroll("right")}
              className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-orange-600 transition-colors shadow-lg shadow-primary/30"
            >
              <span className="material-icons">arrow_forward</span>
            </button>
          </div>
        </div>

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
        >
          {tours.map((tour) => (
            <RecommendedTourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendedTours;
