import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

/* ── Badge colour mapping ──────────────────────────────────── */
const badgeClass = {
  amber: "bg-primary text-white",
  primary: "bg-primary text-white",
  dark: "bg-primary text-white",
};

/* ── Skeleton card while loading ───────────────────────────── */
const SkeletonCard = () => (
  <div className="rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100 animate-pulse">
    <div className="h-56 bg-gray-200" />
    <div className="p-5 space-y-2.5">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-5 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="flex gap-2 pt-2">
        <div className="h-6 bg-gray-200 rounded-full w-20" />
        <div className="h-6 bg-gray-200 rounded-full w-20" />
      </div>
      <div className="h-10 bg-gray-200 rounded-xl mt-4" />
    </div>
  </div>
);

/* ── Star renderer ──────────────────────────────────────────── */
const Stars = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-0.5 text-yellow-400">
      {Array.from({ length: full }).map((_, i) => (
        <span key={i} className="material-icons text-base">
          star
        </span>
      ))}
      {half && <span className="material-icons text-base">star_half</span>}
      {Array.from({ length: 5 - full - (half ? 1 : 0) }).map((_, i) => (
        <span key={i} className="material-icons text-base text-gray-300">
          star
        </span>
      ))}
    </span>
  );
};

/* ── Beautiful Tour Card ────────────────────────────────────── */
const TourCard = ({ tour }) => (
  <div className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer flex flex-col bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
    {/* Image */}
    <div className="relative h-56 overflow-hidden">
      <img
        src={tour.title_image}
        alt={tour.name}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
        decoding="async"
        width="480"
        height="224"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Badge */}
      {tour.badge && (
        <div
          className={`absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide shadow ${badgeClass[tour.badge_color] || badgeClass.primary}`}
        >
          {tour.badge}
        </div>
      )}
      <div className="absolute top-3.5 right-3.5 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide text-gray-900">
        {tour.category || "Tuk-Tuk"}
      </div>

      {/* Rating pill on image */}
      <div className="absolute bottom-3.5 left-3.5 flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[11px] font-semibold">
        <span className="material-icons text-yellow-400 text-sm">star</span>
        {Number(tour.rating).toFixed(1)}
        <span className="text-white/70">({tour.review_count})</span>
      </div>

      {/* Price pill on image */}
      {tour.price_1_person && (
        <div className="absolute bottom-3.5 right-3.5 bg-primary text-white px-2.5 py-1 rounded-full text-[11px] font-extrabold">
          From €{Number(tour.price_1_person).toFixed(0)}/person
        </div>
      )}
    </div>

    {/* Body */}
    <div className="flex flex-col flex-1 p-5">
      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-gray-500 mb-2.5">
        <span className="flex items-center gap-1">
          <span className="material-icons text-primary text-base">
            schedule
          </span>
          {tour.duration} {tour.duration === 1 ? "Hour" : "Hours"}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-icons text-primary text-base">
            language
          </span>
          {tour.guide_language || "English"}
        </span>
        <span className="flex items-center gap-1">
          <span className="material-icons text-primary text-base">eco</span>
          Electric
        </span>
      </div>

      {/* Title */}
      <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-1 leading-snug">
        {tour.name}
        {tour.subtitle && (
          <span className="block text-primary text-sm sm:text-base font-semibold mt-0.5">
            {tour.subtitle}
          </span>
        )}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-xs sm:text-sm leading-relaxed flex-1 mb-3.5 line-clamp-3">
        {tour.details}
      </p>

      {/* Highlights */}
      {tour.highlights && tour.highlights.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-3.5">
          {tour.highlights.slice(0, 4).map((h) => (
            <li
              key={h}
              className="text-[10px] sm:text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200 px-2 py-0.5 rounded-full"
            >
              {h}
            </li>
          ))}
        </ul>
      )}

      {/* Meeting point */}
      {tour.meeting_point && (
        <div className="flex items-start gap-2 text-[11px] sm:text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5 mb-3.5">
          <span className="material-icons text-primary text-sm mt-0.5">
            location_on
          </span>
          <span>{tour.meeting_point}</span>
        </div>
      )}

      {!tour.meeting_point && (
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-500 mb-3.5">
          <span className="material-icons text-primary text-sm">near_me</span>
          <span>Flexible pickup area — details on booking</span>
        </div>
      )}

      {/* CTA Button */}
      <div className="mt-auto">
        <Link
          to={`/tour-details/${tour.id}`}
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm px-3.5 py-2.5 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 flex items-center justify-center gap-1.5"
        >
          Book Now
          <span className="material-icons text-base">arrow_forward</span>
        </Link>
      </div>
    </div>
  </div>
);

/* ── Page Component ─────────────────────────────────────────── */
const Tours = () => {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const loadTours = async () => {
      const { data, error } = await supabase
        .from("tours")
        .select(
          "id,name,subtitle,category,badge,badge_color,duration,people,guide_language,meeting_point,highlights,gallery,details,activity,journey,rating,review_count,price_1_person,price_2_person,price_3_person,price_4_person,price_5_person,price_6_person,title_image",
        )
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Failed to fetch tours:", error);
      } else {
        setTours(data || []);
      }
      setLoading(false);
    };
    loadTours();
  }, []);

  const filters = [
    { key: "all", label: "All Tours" },
    { key: "short", label: "1–2 Hours" },
    { key: "medium", label: "3 Hours" },
    { key: "long", label: "4 Hours" },
  ];

  const filtered = tours.filter((t) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "short") return t.duration <= 2;
    if (activeFilter === "medium") return t.duration === 3;
    if (activeFilter === "long") return t.duration >= 4;
    return true;
  });

  return (
    <div className="bg-background-light text-gray-800 font-display antialiased">
      {/* ── Hero Banner ───────────────────────────── */}
      {/* <section className="relative h-[420px] md:h-[500px] flex items-center justify-center overflow-hidden">
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLxkbEw9gntthXpxIdiV1VNJF10jp5hX7p2EM6NIhndsMmNLn9XIoeg7QlaFduGVgXK6km9egiMAaRTLCga_TGkfax2A0Pox2dcM3P5BNfqY3nc7x5wNqB5fHR98aPJ8qnBPDwxa1bCUtOBPev9hV2azLajkKHoWBHMnePQaJSCeM9az5OJsYjUa6FuwLkKZxIaaPmtk7X2qKADpFDW_WZr5Mocl5FSXLMNiRu_F80C3xS_2SbAYu_AAB-xkXqCJj5mYqmH-mgeg"
          alt="Lisbon tuk-tuk tour panorama"
          className="absolute inset-0 w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/70 via-gray-900/50 to-background-light" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/40 text-primary text-sm font-semibold mb-4">
            <span className="material-icons text-sm">electric_rickshaw</span>
            100% Electric Tuk-Tuk Adventures
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
            Explore Lisbon Your Way
          </h1>
          <p className="text-lg text-white/80 max-w-xl mx-auto">
            Three handcrafted routes through the soul of Lisbon — aboard a 100%
            electric tuk-tuk with a licensed local guide who knows every hidden
            corner.
          </p>
        </div>
      </section> */}

      {/* ── Tour Cards ────────────────────────────── */}
      <section className="py-12 sm:py-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header + filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-9 sm:mb-10">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm">
                Tuk-Tuk Experiences
              </span>
              <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-2 sm:mb-1 leading-snug">
                Choose Your Adventure
              </h2>
              <p className="mt-2 text-sm sm:text-sm text-gray-500 max-w-lg">
                Every route is private, customisable, and fully led by a
                licensed English-speaking Lisbon insider.
              </p>
            </div>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2">
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold border transition-all ${
                    activeFilter === f.key
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/25"
                      : "bg-white text-gray-600 border-gray-200 hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          {loading ? (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <span className="material-icons text-5xl text-gray-300 mb-4 block">
                search_off
              </span>
              <p className="text-gray-500 text-lg">
                No tours match this filter.
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-4 text-primary font-semibold hover:underline"
              >
                View all tours
              </button>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Tours;
