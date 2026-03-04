import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const BADGE_COLOR = {
  amber: "bg-amber-400 text-gray-900",
  primary: "bg-primary text-white",
  dark: "bg-gray-900 text-white",
};

const Home = () => {
  const [tours, setTours] = useState([]);
  const [toursLoading, setToursLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("tours")
        .select(
          "id,name,subtitle,badge,badge_color,duration,guide_language,meeting_point,highlights,title_image,price",
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

  useEffect(() => {
    supabase
      .from("reviews")
      .select("id,name,country,tour_name,rating,review_text,photo_url")
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => {
        setReviews(data || []);
        setReviewsLoading(false);
      });
  }, []);

  return (
    <div className="bg-background-light text-gray-800 font-display antialiased selection:bg-primary selection:text-white overflow-x-hidden">
      <header className="relative pt-5 min-h-screen flex items-center">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-azulejo-light clip-path-slant hidden lg:block -z-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid lg:grid-cols-12 gap-12 items-center py-12">
          <div className="lg:col-span-5 order-2 lg:order-1 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
              <span className="material-icons text-sm">verified</span>
              Verified Local Guide
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
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
              , Tour with Guide
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Skip the tourist traps. Discover the hidden gems, authentic
              stories, and the warm soul of Lisbon with me, your personal guide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary/25 transition-all hover:-translate-y-1 text-center flex items-center justify-center gap-2"
                href="#tours"
              >
                Find Your Tour
                <span className="material-icons text-sm">arrow_forward</span>
              </a>
              <a
                className="bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-8 py-4 rounded-xl font-semibold transition-all text-center flex items-center justify-center gap-2 group"
                href="#about"
              >
                <span className="material-icons text-primary group-hover:scale-110 transition-transform">
                  play_circle
                </span>
                Watch Video
              </a>
            </div>
            <div className="mt-12 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-3">
                <img
                  alt="Happy traveler portrait"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  data-alt="Portrait of a smiling young woman traveler"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJctZ2ALBWAEgWkihBhR_FUmpwmHJxLxZ6h9VOdqudXkzZKgeg_08WA0Zasco4o8w0BwD5LgHorIzQKmUNokI3FSGla5W4l22OUjw1znz_zr6IFWMFfcx_fW8hof_LYudG6zz0qfRXlUzuLjunzxcLRewDFmjWDgDcwsljk0SSlGl1UM-uNoqkuTRKFJuCUUUmqwCOL-1RqOS69YdH03zS-K4FFo_woQp9x6RIqfZanDvC9Ih1nINB6ouN72EaJ471Oi781J6m0Q"
                />
                <img
                  alt="Happy traveler portrait"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  data-alt="Portrait of a smiling man traveler"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7clSp0dZ45DgfaQ-zeGQ_lZ9vYQUA-mpuWs_bIMTioUTZYda0X18uOe8xVT736CkNflBHwismtHvJd00-t7wx0JrJ3aGxXQULqhMVvXwYgzhod9QjmwLUAp7yBBiHF5m7iYzV_LMXZwQKeKW0jdTRrytz_JGTgrdEOODHXzszmuKXn4ESId3Ty6oj0B3EMA0SLh1RiN9lzlFEdVwUMsBYnxttYfivccfwWFn4zvS4v1E_94WDo2qcEuI5J0hTTMq8IFetCRtHg"
                />
                <img
                  alt="Happy traveler portrait"
                  className="w-10 h-10 rounded-full border-2 border-white object-cover"
                  data-alt="Portrait of a smiling man with glasses"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuASX5uH6Zpnj-PoHiliVRUoefOIug-qIttn3s9XO3VcLq49CTcOjk9MbS1k-ZbRIf-N2fxiWCZvoEvneuJtFBgVu9z39uYhZ_ywH_aI7kUzGE-c-wWLbO_BTbdy4ny9dlXrj0gE_3PI7SbG8ZvODTne0D1nlAuYiEfqct70dQ85ZUZqBISmr-KJLHQKe2kWzgFL3UD4a7qtd8RvdXX15g9dc9X7i92RfWmtjNEhI-wY2r-eOSg_IW8FjjWpfEVp_wHl3V28pIFv1A"
                />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold">
                  +2k
                </div>
              </div>
              <p>Happy travelers guided this year.</p>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 relative h-[260px] sm:h-[380px] lg:h-[700px]">
            <div className="absolute right-0 top-10 lg:top-0 w-4/5 h-full rounded-2xl overflow-hidden shadow-2xl z-10">
              <img
                alt="Friendly male tour guide in Lisbon"
                className="w-full h-full object-cover"
                data-alt="Portrait of a friendly tour guide smiling outdoors"
                src="https://zgwtpnrggmmvuukcikha.supabase.co/storage/v1/object/sign/test/eduardo-goody-0Iu7mKa1sPw-unsplash.jpg?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV80ZDkzZTdkMi1jYmUyLTRjNDYtYWQwYS1lMjk0YzRlNDhiZTEiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJ0ZXN0L2VkdWFyZG8tZ29vZHktMEl1N21LYTFzUHctdW5zcGxhc2guanBnIiwiaWF0IjoxNzcyNjQ2NzcxLCJleHAiOjM3NDUwMTA0ODM1NzF9.ordlTYzFyd_R0XKnqkcHWZCOM1ggR7DbtyBO7qClhgQ"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-xl">Entertainment Mama</p>
                <p className="text-sm opacity-90">Your Lisbon Insider</p>
              </div>
            </div>
            <div className="absolute left-0 bottom-20 w-2/5 aspect-[4/5] rounded-xl overflow-hidden shadow-xl border-4 border-white transform -rotate-3 z-20 hidden sm:block">
              <img
                alt="Yellow tram in Lisbon street"
                className="w-full h-full object-cover"
                data-alt="Classic yellow tram climbing a narrow street in Lisbon"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDG8MZRRl65lMXOr8Cl3IG5L6Nop4FqesAQXVdBktlQPHvbWOtdj_DH9eLENOGslOvyh9j40yuS1FTb7sUScSys-zp9Y26M8SfTceaK5iPPwLdVqZbTJlHEJc4cD0z4ij004dcXZa980MUOpixZzgG6gZskN7fOZ1QodxYm38Ib-52adugqCiBq2o1I4YR-7bsXKOL-Z2mJohGGs66gJOD6gE7G6761YIcdCMka9ZSeBEr93SKUC781fejxYLWgbGVjc_wzlr1hnw"
              />
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary rounded-full blur-2xl opacity-20 z-0"></div>
          </div>
        </div>
      </header>

      <section className="py-20 lg:py-28 bg-white" id="about">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">
            Bem-vindo a Lisboa
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 mb-8">
            Not just a guide, but a friend in the city.
          </h2>
          <div className="relative inline-block text-left">
            <span className="material-icons absolute -left-8 -top-4 text-4xl text-primary/20 transform -scale-x-100">
              format_quote
            </span>
            <p className="text-xl md:text-2xl text-gray-600 font-light leading-relaxed mb-8">
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
            <div className="flex justify-center items-center mt-8">
              <div className="h-px w-16 bg-primary/30"></div>
              <span
                className="text-3xl text-primary mx-4 font-bold italic"
                style={{ fontFamily: "cursive" }}
              >
                Entertainment Mama
              </span>
              <div className="h-px w-16 bg-primary/30"></div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background-light" id="tours">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-14 gap-6">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm">
                Tuk-Tuk Experiences
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                Choose Your Adventure
              </h2>
              <p className="text-gray-600 max-w-xl">
                Three handcrafted routes through the soul of Lisbon — each one
                aboard a 100% electric tuk-tuk with a licensed local guide.
              </p>
            </div>
            <a
              className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
              href="/tours"
            >
              View All Tours
              <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          {/* ── Loading skeletons ── */}
          {toursLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg animate-pulse"
                >
                  <div className="h-64 bg-gray-200" />
                  <div className="p-6 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                    <div className="h-5 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                    <div className="h-10 bg-gray-200 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Dynamic tour cards ── */}
          {!toursLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <div className="relative h-64 overflow-hidden">
                      <img
                        alt={tour.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        src={tour.title_image}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      {tour.badge && (
                        <div
                          className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide shadow ${badgeCls}`}
                        >
                          {tour.badge}
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-900">
                        Tuk-Tuk
                      </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-col flex-1 p-6">
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-primary text-base">
                            schedule
                          </span>
                          {tour.duration} Hour{tour.duration !== 1 ? "s" : ""}
                        </span>
                        {tour.guide_language && (
                          <span className="flex items-center gap-1">
                            <span className="material-icons text-primary text-base">
                              language
                            </span>
                            {tour.guide_language.split(/[,/]/)[0].trim()}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-icons text-primary text-base">
                            eco
                          </span>
                          Electric
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-gray-900 mb-2 leading-snug">
                        {tour.name}
                        {tour.subtitle && (
                          <span className="block text-primary text-base font-semibold mt-0.5">
                            {tour.subtitle}
                          </span>
                        )}
                      </h3>

                      {/* Highlights */}
                      {highlights.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5 mb-5">
                          {highlights.slice(0, 4).map((h) => (
                            <li
                              key={h}
                              className="text-[11px] font-medium bg-primary/8 text-primary border border-primary/20 px-2.5 py-1 rounded-full"
                            >
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Meeting point */}
                      {tour.meeting_point && (
                        <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-5">
                          <span className="material-icons text-primary text-sm mt-0.5">
                            location_on
                          </span>
                          <span>{tour.meeting_point}</span>
                        </div>
                      )}

                      {/* Price */}
                      {tour.price && (
                        <p className="text-sm font-bold text-gray-900 mb-4">
                          From{" "}
                          <span className="text-primary text-lg">
                            €{Number(tour.price).toFixed(0)}
                          </span>
                          <span className="text-gray-400 font-normal">
                            {" "}
                            / person
                          </span>
                        </p>
                      )}

                      <Link
                        to={`/tour-details/${tour.id}`}
                        className="mt-auto inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-sm px-5 py-3 rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20"
                      >
                        Book This Tour
                        <span className="material-icons text-sm">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-10 text-center md:hidden">
            <a
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
              href="/tours"
            >
              View All Tours
              <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 bg-azulejo/5 relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="0 0 2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%232c4c6e" fill-opacity="1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm">
                Guest Love
              </span>
              <h2 className="mt-2 text-3xl md:text-4xl font-bold text-gray-900">
                What Guests Say
              </h2>
            </div>
            <Link
              to="/feedback"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors text-sm"
            >
              Leave a Review
              <span className="material-icons text-sm">arrow_forward</span>
            </Link>
          </div>

          {/* Loading skeleton */}
          {reviewsLoading && (
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[85%] md:min-w-[400px] snap-center bg-white rounded-2xl p-6 shadow-md border border-gray-100 animate-pulse flex-shrink-0"
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
              <p className="text-gray-500 font-semibold text-lg mb-6">
                No reviews yet — be the first to share your experience!
              </p>
              <Link
                to="/feedback"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
              >
                Write a Review
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          )}

          {/* Dynamic review cards */}
          {!reviewsLoading && reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 flex flex-col"
                >
                  <div className="flex items-center gap-4 mb-4">
                    {review.photo_url ? (
                      <img
                        alt={review.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-azulejo-light flex-shrink-0"
                        src={review.photo_url}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-azulejo-light flex items-center justify-center text-primary font-bold text-xl flex-shrink-0">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-gray-900">{review.name}</h4>
                      <p className="text-xs text-gray-500">{review.country}</p>
                    </div>
                    <div className="ml-auto flex">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          className={`material-icons text-lg ${
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
                  <p className="text-gray-600 italic mb-4 flex-grow">
                    "{review.review_text}"
                  </p>
                  <div className="pt-4 border-t border-gray-100 mt-auto">
                    <span className="text-xs font-semibold text-azulejo bg-azulejo-light px-2 py-1 rounded">
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
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                Show More Reviews
                <span className="material-icons text-sm">arrow_forward</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-azulejo-light relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(#2c4c6e 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        ></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <span className="material-icons text-3xl">person</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                100% Private &amp; Personal
              </h3>
              <p className="text-gray-600">
                Just you and your group. No strangers, no rushing. We move at
                your pace and follow your curiosity.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <span className="material-icons text-3xl">local_offer</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Tailored to You
              </h3>
              <p className="text-gray-600">
                Want more food stops? Interested in history? I customize the
                route on the fly to match your interests.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 text-primary">
                <span className="material-icons text-3xl">map</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Beyond the Map
              </h3>
              <p className="text-gray-600">
                I'll take you to spots that aren't in the guidebooks—local
                tascas, secret gardens, and hidden art.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="h-[400px] relative flex items-center justify-center bg-gray-900">
        <img
          alt="Map of Lisbon streets"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          data-alt="Abstract view of Lisbon map overlay"
          data-location="Lisbon, Portugal"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCigwnqH2qCEO-1M4LXgujwqyieBverNQuCPK9hGH7UuQZfeYiQFzKaSP2--nnb08_mUickcpHC650HdKQGA_uqXDHgTN2O1l3M_twf_dup_MYJ1Crt-ImCiUPpvlVkChgDMKcdmJlv8dPzFqAZoX7QD0zCVkravi85a1MWHk8Np5Io_3ICurxwFWndCAJSXB841Xc3M-yZw53rNgXqRwn7afpJHvEkRF5hKTEuPN5rlYe758dyQ0n9h4ijxBj4q0ZbqCupSbzA_w"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-azulejo/90 to-azulejo/60 mix-blend-multiply"></div>
        <div className="relative z-10 text-center px-4">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to get lost in the right direction?
          </h2>
          <a
            className="inline-block bg-primary hover:bg-primary-dark text-white text-lg px-10 py-4 rounded-xl font-bold shadow-xl shadow-black/20 transition-transform hover:-translate-y-1"
            href="/tours"
          >
            Start Planning Your Trip
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
