import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import TourPreviewPopup from "../components/TourPreviewPopup";
import SEO from "../components/SEO";

const BADGE_COLOR = {
  amber: "bg-primary text-white",
  primary: "bg-primary text-white",
  dark: "bg-primary text-white",
};

const Home = () => {
  const [tours, setTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("tours")
        .select(
          "id,name,subtitle,badge,badge_color,duration,guide_language,meeting_point,highlights,title_image,price,gallery,details,category,rating,review_count,people,activity",
        )
        .order("id", { ascending: true })
        .limit(3);
      setTours(data || []);
      setToursLoading(false);
    };
    load();
  }, []);

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canScrollReviews, setCanScrollReviews] = useState(false);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id,name,country,tour_name,rating,review_text,photo_url")
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setReviews(data || []);
        setReviewsLoading(false);
      });
  }, []);

  const [selectedTour, setSelectedTour] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const reviewCarouselRef = useRef(null);
  const isReviewDraggingRef = useRef(false);
  const reviewDragStartXRef = useRef(0);
  const reviewDragStartScrollLeftRef = useRef(0);

  const handlePreviewClick = (tour) => {
    setSelectedTour(tour);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedTour(null);
  };

  useEffect(() => {
    const checkScrollable = () => {
      const track = reviewCarouselRef.current;
      if (!track) {
        setCanScrollReviews(false);
        return;
      }
      setCanScrollReviews(track.scrollWidth - track.clientWidth > 2);
    };

    checkScrollable();
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [reviews, reviewsLoading]);

  const getReviewStep = () => {
    const track = reviewCarouselRef.current;
    if (!track) return 0;
    const firstCard = track.firstElementChild;
    const cardWidth = firstCard
      ? firstCard.clientWidth
      : track.clientWidth * 0.9;
    const styles = window.getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    return cardWidth + gap;
  };

  const snapReviewsToNearest = () => {
    const track = reviewCarouselRef.current;
    if (!track) return;
    const step = getReviewStep();
    if (!step) return;
    const target = Math.round(track.scrollLeft / step) * step;
    track.scrollTo({ left: target, behavior: "smooth" });
  };

  const handleReviewsDragStart = (clientX) => {
    const track = reviewCarouselRef.current;
    if (!track) return;
    isReviewDraggingRef.current = true;
    reviewDragStartXRef.current = clientX;
    reviewDragStartScrollLeftRef.current = track.scrollLeft;
    track.style.scrollSnapType = "none";
    track.style.scrollBehavior = "auto";
  };

  const handleReviewsDragMove = (clientX) => {
    const track = reviewCarouselRef.current;
    if (!track || !isReviewDraggingRef.current) return;
    const dx = clientX - reviewDragStartXRef.current;
    track.scrollLeft = reviewDragStartScrollLeftRef.current - dx;
  };

  const handleReviewsDragEnd = () => {
    const track = reviewCarouselRef.current;
    if (!track || !isReviewDraggingRef.current) return;
    isReviewDraggingRef.current = false;
    track.style.scrollSnapType = "x mandatory";
    track.style.scrollBehavior = "smooth";
    snapReviewsToNearest();
  };

  const scrollReviews = (direction) => {
    if (!reviewCarouselRef.current) return;
    const step = getReviewStep();

    reviewCarouselRef.current.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    });
  };

  return (
    <div className="bg-background-light text-gray-800 font-display antialiased selection:bg-primary selection:text-white overflow-x-hidden">
      <header className="relative pt-16 sm:pt-20 md:pt-24 lg:pt-28 min-h-[auto] lg:min-h-screen flex items-start">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-azulejo-light clip-path-slant hidden lg:block -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-12 gap-7 sm:gap-10 lg:gap-12 items-start lg:items-center pb-8 sm:pb-10 lg:py-12">
          <div className="lg:col-span-5 order-2 lg:order-1 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-primary/20">
              <span className="material-icons text-sm">verified</span>
              Verified Local Guide
            </div>
            <h1 className="text-2xl sm:text-4xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-4 sm:mb-6">
              Lisbon: City Highlights{" "}
              <span className="text-primary relative whitespace-nowrap">
                Tuk-Tuk
                <svg
                  className="absolute w-full h-3 -bottom-1 left-0 text-primary/30"
                  preserveAspectRatio="none"
                  viewBox="0 0 100 10"
                >
                  <path
                    d="M0 5 Q 50 10 100 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  ></path>
                </svg>
              </span>
              lut , Tour with Guide
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-5 sm:mb-8 leading-relaxed">
              Skip the tourist traps. Discover the hidden gems, authentic
              stories, and the warm soul of Lisbon with me, your personal guide.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                className="bg-primary hover:bg-primary-dark text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                href="#tours"
              >
                Find Your Tour
                <span className="material-icons text-sm">arrow_forward</span>
              </a>
              <a
                className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base transition-all text-center flex items-center justify-center gap-2 group"
                href="#about"
              >
                <span className="material-icons text-primary group-hover:scale-110 transition-transform">
                  play_circle
                </span>
                About Me
              </a>
            </div>
            <div className="mt-7 sm:mt-10 flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
              <div className="flex -space-x-3">
                <img
                  alt="Happy traveler portrait"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  data-alt="Portrait of a smiling young woman traveler"
                  loading="lazy"
                  decoding="async"
                  width="40"
                  height="40"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJctZ2ALBWAEgWkihBhR_FUmpwmHJxLxZ6h9VOdqudXkzZKgeg_08WA0Zasco4o8w0BwD5LgHorIzQKmUNokI3FSGla5W4l22OUjw1znz_zr6IFWMFfcx_fW8hof_LYudG6zz0qfRXlUzuLjunzxcLRewDFmjWDgDcwsljk0SSlGl1UM-uNoqkuTRKFJuCUUUmqwCOL-1RqOS69YdH03zS-K4FFo_woQp9x6RIqfZanDvC9Ih1nINB6ouN72EaJ471Oi781J6m0Q"
                />
                <img
                  alt="Happy traveler portrait"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  data-alt="Portrait of a smiling man traveler"
                  loading="lazy"
                  decoding="async"
                  width="40"
                  height="40"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7clSp0dZ45DgfaQ-zeGQ_lZ9vYQUA-mpuWs_bIMTioUTZYda0X18uOe8xVT736CkNflBHwismtHvJd00-t7wx0JrJ3aGxXQULqhMVvXwYgzhod9QjmwLUAp7yBBiHF5m7iYzV_LMXZwQKeKW0jdTRrytz_JGTgrdEOODHXzszmuKXn4ESId3Ty6oj0B3EMA0SLh1RiN9lzlFEdVwUMsBYnxttYfivccfwWFn4zvS4v1E_94WDo2qcEuI5J0hTTMq8IFetCRtHg"
                />
                <img
                  alt="Happy traveler portrait"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  data-alt="Portrait of a smiling man with glasses"
                  loading="lazy"
                  decoding="async"
                  width="40"
                  height="40"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuASX5uH6Zpnj-PoHiliVRUoefOIug-qIttn3s9XO3VcLq49CTcOjk9MbS1k-ZbRIf-N2fxiWCZvoEvneuJtFBgVu9z39uYhZ_ywH_aI7kUzGE-c-wWLbO_BTbdy4ny9dlXrj0gE_3PI7SbG8ZvODTne0D1nlAuYiEfqct70dQ85ZUZqBISmr-KJLHQKe2kWzgFL3UD4a7qtd8RvdXX15g9dc9X7i92RfWmtjNEhI-wY2r-eOSg_IW8FjjWpfEVp_wHl3V28pIFv1A"
                />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold">
                  +2k
                </div>
              </div>
              <p>Happy travelers guided this year.</p>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 relative h-[310px] sm:h-[380px] lg:h-[700px]">
            <div className="absolute right-0 top-0 sm:top-10 lg:top-0 w-[86%] sm:w-4/5 h-[92%] sm:h-full rounded-2xl overflow-hidden shadow-2xl z-10">
              <img
                alt="Friendly male tour guide in Lisbon"
                className="w-full h-full object-cover"
                data-alt="Portrait of a friendly tour guide smiling outdoors"
                fetchpriority="high"
                width="600"
                height="750"
                src="https://zgwtpnrggmmvuukcikha.supabase.co/storage/v1/object/sign/test/eduardo-goody-0Iu7mKa1sPw-unsplash.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ZDkzZTdkMi1jYmUyLTRjNDYtYWQwYS1lMjk0YzRlNDhiZTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0L2VkdWFyZG8tZ29vZHktMEl1N21LYTFzUHctdW5zcGxhc2guanBnIiwiaWF0IjoxNzcyNjQ2NzcxLCJleHAiOjM3NDUwMTA0ODM1NzF9.ordlTYzFyd_R0XKnqkcHWZCOM1ggR7DbtyBO7qClhgQ"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-4 sm:bottom-6 left-4 sm:left-6 text-white">
                <p className="font-bold text-lg sm:text-xl">
                  Entertainment Mama
                </p>
                <p className="text-xs sm:text-sm opacity-90">
                  Your Lisbon Insider
                </p>
              </div>
            </div>
            <div className="absolute left-2 sm:left-0 bottom-3 sm:bottom-20 w-24 sm:w-2/5 aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-4 border-white transform -rotate-3 z-20">
              <img
                alt="Yellow tram in Lisbon street"
                className="w-full h-full object-cover"
                data-alt="Classic yellow tram climbing a narrow street in Lisbon"
                loading="lazy"
                decoding="async"
                width="240"
                height="300"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG8MZRRl65lMXOr8Cl3IG5L6Nop4FqesAQXVdBktlQPHvbWOtdj_DH9eLENOGslOvyh9j40yuS1FTb7sUScSys-zp9Y26M8SfTceaK5iPPwLdVqZbTJlHEJc4cD0z4ij004dcXZa980MUOpixZzgG6gZskN7fOZ1QodxYm38Ib-52adugqCiBq2o1I4YR-7bsXKOL-Z2mJohGGs66gJOD6gE7G6761YIcdCMka9ZSeBEr93SKUC781fejxYLWgbGVjc_wzlr1hnw"
              />
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary rounded-full blur-2xl opacity-20 z-0"></div>
          </div>
        </div>
      </header>

      <section className="py-12 sm:py-16 lg:py-24 bg-white" id="about">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary font-bold tracking-wider uppercase text-[11px] sm:text-sm">
            Bem-vindo a Lisboa
          </span>
          <h2 className="mt-2 sm:mt-3 text-xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-5 sm:mb-8 leading-snug">
            Not just a guide, but a friend in the city.
          </h2>
          <div className="relative max-w-2xl sm:max-w-3xl mx-auto text-left px-0 sm:px-0">
            <span className="material-icons sm:hidden text-primary/25 text-lg mb-2 block">
              format_quote
            </span>
            <span className="material-icons hidden sm:block absolute left-0 lg:-left-8 -top-5 sm:-top-4 text-xl sm:text-4xl text-primary/20 transform -scale-x-100">
              format_quote
            </span>
            <p className="text-[13px] sm:text-base md:text-2xl text-gray-600 font-light leading-6 sm:leading-relaxed mb-5 sm:mb-8 pl-0 sm:pl-0">
              "Hi, I’m Mama, your local friend in Lisbon, and I created
              Entertainment Mama to offer the smartest, greenest, and most fun
              way to explore this beautiful city. With our 100% electric{" "}
              <span className="font-semibold text-primary">TUK-TUKS</span>, we
              easily navigate the charming streets of Alfama and the lively
              hills of Bairro Alto, sharing real stories, local flavors, and
              hidden gems along the way. No rehearsed scripts—just authentic
              experiences, breathtaking viewpoints, and a tour fully tailored to
              your interests, so you can relax and enjoy Lisbon like you’re
              visiting an old friend."
            </p>
            <div className="flex justify-center items-center mt-5 sm:mt-8 gap-2 sm:gap-3">
              <div className="hidden sm:block h-px w-16 bg-primary/30"></div>
              <span
                className="text-sm sm:text-3xl text-primary font-bold italic"
                style={{ fontFamily: "cursive" }}
              >
                Entertainment Mama
              </span>
              <div className="hidden sm:block h-px w-16 bg-primary/30"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-20 bg-background-light" id="tours">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 sm:mb-12 gap-5 sm:gap-6">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-[11px] sm:text-sm">
                Tuk-Tuk Experiences
              </span>
              <h2 className="mt-1.5 sm:mt-2 text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">
                Choose Your Adventure
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-xl">
                Three handcrafted routes through the soul of Lisbon — each one
                aboard a 100% electric tuk-tuk with a licensed local guide.
              </p>
            </div>
            <a
              className="hidden md:flex items-center gap-2 text-sm text-primary font-bold hover:text-primary-dark transition-colors"
              href="/tours"
            >
              View All Tours
              <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          {/* ── Loading skeletons ── */}
          {toursLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg animate-pulse"
                >
                  <div className="h-48 sm:h-56 md:h-64 bg-gray-200" />
                  <div className="p-4 sm:p-5 md:p-6 space-y-3">
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-4 sm:h-5 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-full" />
                    <div className="h-3 bg-gray-200 rounded w-5/6" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-8 sm:h-10 bg-gray-200 rounded-xl flex-1" />
                      <div className="h-8 sm:h-10 bg-gray-200 rounded-xl flex-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Dynamic tour cards ── */}
          {!toursLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {tours.map((tour) => {
                const highlights = Array.isArray(tour.highlights)
                  ? tour.highlights
                  : typeof tour.highlights === "string" && tour.highlights
                    ? tour.highlights
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean)
                    : [];
                const badgeCls =
                  BADGE_COLOR[tour.badge_color] || BADGE_COLOR.primary;
                return (
                  <div
                    key={tour.id}
                    className="group relative rounded-2xl overflow-hidden shadow-lg cursor-pointer flex flex-col bg-white border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                  >
                    {/* Image */}
                    <div className="relative h-40 sm:h-52 md:h-60 overflow-hidden">
                      <img
                        alt={tour.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        width="480"
                        height="240"
                        src={tour.title_image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {tour.badge && (
                        <div
                          className={`absolute top-3 sm:top-4 left-3 sm:left-4 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-extrabold uppercase tracking-wide shadow ${badgeCls}`}
                        >
                          {tour.badge}
                        </div>
                      )}
                      <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-white/90 backdrop-blur-sm px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-900">
                        Tuk-Tuk
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-3 sm:p-5 md:p-6">
                      <div className="flex flex-row flex-wrap items-center gap-2.5 sm:gap-3 md:gap-4 text-[11px] sm:text-sm text-gray-500 mb-2.5 sm:mb-4">
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-primary text-sm sm:text-base">
                            schedule
                          </span>
                          {tour.duration}h
                        </span>
                        {tour.guide_language && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-primary text-sm sm:text-base">
                              language
                            </span>
                            {tour.guide_language.split(/[,/]/)[0].trim()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-primary text-sm sm:text-base">
                            eco
                          </span>
                          Electric
                        </span>
                      </div>

                      <h3 className="text-base sm:text-xl font-extrabold text-gray-900 mb-1.5 sm:mb-2 leading-snug">
                        {tour.name}
                        {tour.subtitle && (
                          <span className="block text-primary text-xs sm:text-base font-semibold mt-0.5">
                            {tour.subtitle}
                          </span>
                        )}
                      </h3>

                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 mb-2.5 sm:mb-5">
                          {highlights.slice(0, 3).map((h) => (
                            <li
                              key={h}
                              className="text-[9px] sm:text-[11px] font-medium bg-gray-100 text-gray-700 border border-gray-200 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full"
                            >
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Price */}
                      {tour.price && (
                        <p className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5 sm:mb-3">
                          From{" "}
                          <span className="text-primary text-base sm:text-lg">
                            €{Number(tour.price).toFixed(0)}
                          </span>
                          <span className="text-gray-400 font-normal text-xs sm:text-sm ml-1">
                            /person
                          </span>
                        </p>
                      )}

                      <div className="mt-auto flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handlePreviewClick(tour)}
                          className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 bg-white border-2 border-primary hover:bg-primary/5 text-primary font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all"
                        >
                          <span className="material-icons text-sm">
                            visibility
                          </span>
                          <span>Preview</span>
                        </button>
                        <Link
                          to={`/tour-details/${tour.id}`}
                          className="w-full sm:flex-1 inline-flex items-center justify-center gap-1.5 bg-primary hover:bg-primary-dark text-white font-bold text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
                        >
                          Book
                          <span className="material-icons text-sm">
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 sm:mt-10 text-center md:hidden">
            <a
              className="inline-flex items-center gap-2 text-sm text-primary font-bold hover:text-primary-dark transition-colors"
              href="/tours"
            >
              View All Tours
              <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-azulejo/5 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="0 0 2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%232c4c6e" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 sm:mb-10 gap-4">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-[10px] sm:text-xs">
                Guest Love
              </span>
              <h2 className="mt-1 sm:mt-2 text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                What Guests Say
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
              <Link
                to="/feedback"
                className="inline-flex items-center gap-1.5 text-primary font-bold hover:text-primary-dark transition-colors text-xs sm:text-sm"
              >
                Leave a Review
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
              {!reviewsLoading && reviews.length > 1 && canScrollReviews && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollReviews("left")}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                    aria-label="Scroll reviews left"
                  >
                    <span className="material-icons text-base">
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={() => scrollReviews("right")}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-primary hover:border-primary transition-colors flex items-center justify-center"
                    aria-label="Scroll reviews right"
                  >
                    <span className="material-icons text-base">
                      chevron_right
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Loading skeleton */}
          {reviewsLoading && (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[85%] sm:min-w-[70%] md:min-w-[48%] lg:min-w-[34%] xl:min-w-[32%] snap-center bg-white rounded-2xl p-6 shadow-md border border-gray-100 animate-pulse flex-shrink-0"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                      <div className="h-3 bg-gray-200 rounded w-1/3" />
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-2/5 mt-4" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!reviewsLoading && reviews.length === 0 && (
            <div className="text-center py-16">
              <span className="material-icons text-6xl text-gray-200 block mb-4">
                rate_review
              </span>
              <p className="text-gray-500 font-semibold text-base sm:text-lg mb-6">
                No reviews yet — be the first to share your experience!
              </p>
              <Link
                to="/feedback"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm sm:text-base px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
              >
                Write a Review
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* Dynamic review cards */}
          {!reviewsLoading && reviews.length > 0 && (
            <div
              ref={reviewCarouselRef}
              className="flex gap-3 sm:gap-5 overflow-x-auto pb-3 sm:pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 cursor-grab active:cursor-grabbing select-none touch-pan-y"
              onMouseDown={(e) => handleReviewsDragStart(e.clientX)}
              onMouseMove={(e) => handleReviewsDragMove(e.clientX)}
              onMouseUp={handleReviewsDragEnd}
              onMouseLeave={handleReviewsDragEnd}
              onTouchStart={(e) => handleReviewsDragStart(e.touches[0].clientX)}
              onTouchMove={(e) => handleReviewsDragMove(e.touches[0].clientX)}
              onTouchEnd={handleReviewsDragEnd}
              onTouchCancel={handleReviewsDragEnd}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="min-w-[88%] sm:min-w-[70%] md:min-w-[48%] lg:min-w-[34%] xl:min-w-[32%] snap-start bg-white rounded-2xl p-4 sm:p-5 lg:p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 flex flex-col"
                >
                  <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                    {review.photo_url ? (
                      <img
                        alt={review.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-azulejo-light flex-shrink-0"
                        loading="lazy"
                        decoding="async"
                        width="48"
                        height="48"
                        src={review.photo_url}
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 border-2 border-azulejo-light flex items-center justify-center text-primary font-bold text-lg sm:text-xl flex-shrink-0">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-gray-900 leading-tight break-words">
                        {review.name}
                      </h4>
                      <p className="text-xs text-gray-500">{review.country}</p>
                    </div>
                    <div className="ml-0 sm:ml-auto flex shrink-0">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`material-icons text-base sm:text-lg ${
                            i < review.rating
                              ? "text-yellow-400"
                              : "text-gray-200"
                          }`}
                        >
                          star
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-600 italic leading-relaxed mb-4 flex-grow break-words">
                    "{review.review_text}"
                  </p>
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <span className="inline-block max-w-full text-[11px] sm:text-xs font-semibold text-azulejo bg-azulejo-light px-2 py-1 rounded break-words">
                      Tour: {review.tour_name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Show More Reviews */}
          {!reviewsLoading && reviews.length > 0 && (
            <div className="text-center mt-10">
              <Link
                to="/guest-stories"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white text-sm sm:text-base px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                Show More Reviews
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-azulejo-light relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(#2c4c6e 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 text-primary">
                <span className="material-icons text-base sm:text-2xl">
                  person
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2.5 leading-snug">
                100% Private &amp; Personal
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Just you and your group. No strangers, no rushing. We move at
                your pace and follow your curiosity.
              </p>
            </div>
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 text-primary">
                <span className="material-icons text-base sm:text-2xl">
                  local_offer
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2.5 leading-snug">
                Tailored to You
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Want more food stops? Interested in history? I customize the
                route on the fly to match your interests.
              </p>
            </div>
            <div className="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 sm:w-12 sm:h-12 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center mb-2 sm:mb-4 text-primary">
                <span className="material-icons text-base sm:text-2xl">
                  map
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2.5 leading-snug">
                Beyond the Map
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                I'll take you to spots that aren't in the guidebooks—local
                tascas, secret gardens, and hidden art.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* <section className="h-[300px] sm:h-[360px] md:h-[400px] relative flex items-center justify-center bg-gray-900">
        <img
          alt="Map of Lisbon streets"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          data-alt="Abstract view of Lisbon map overlay"
          data-location="Lisbon, Portugal"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCigwnqH2qCEO-1M4LXgujwqyieBverNQuCPK9hGH7UuQZfeYiQFzKaSP2--nnb08_mUickcpHC650HdKQGA_uqXDHgTN2O1l3M_twf_dup_MYJ1Crt-ImCiUPpvlVkChgDMKcdmJlv8dPzFqAZoX7QD0zCVkravi85a1MWHk8Np5Io_3ICurxwFWndCAJSXB841Xc3M-yZw53rNgXqRwn7afpJHvEkRF5hKTEuPN5rlYe758dyQ0n9h4ijxBj4q0ZbqCupSbzA_w"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-azulejo/90 to-azulejo/60 mix-blend-multiply"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-xl sm:text-3xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
            Ready to get lost in the right direction?
          </h2>
          <a
            className="inline-block bg-primary hover:bg-primary-dark text-white text-sm sm:text-lg px-6 sm:px-10 py-3 sm:py-4 rounded-xl font-bold shadow-xl shadow-black/20 transition-transform hover:-translate-y-1"
            href="/tours"
          >
            Start Planning Your Trip
          </a>
        </div>
      </section> */}

      <Footer />
      <TourPreviewPopup
        tour={selectedTour}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
      />

      {/* ── WhatsApp floating button ── */}
      <a
        href="https://wa.me/+351920377914"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 group flex items-center gap-3"
      >
        {/* Tooltip */}
        <span className="opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-200 bg-gray-900 text-white text-sm font-semibold px-3 py-1.5 rounded-lg shadow-lg whitespace-nowrap pointer-events-none">
          Chat with us
        </span>
        {/* Button */}
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
    </div>
  );
};

export default Home;
