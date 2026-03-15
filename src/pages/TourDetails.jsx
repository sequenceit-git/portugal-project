import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import GalleryScroller from "../components/GalleryScroller";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import MeetingPoints from "../components/MeetingPoints";
import TourItinerary from "../components/TourItinerary";
import RecommendedTours from "../components/RecommendedTours";
import { STATIC_ITINERARY_CONFIG } from "../components/StaticItineraryConfig";

const TourDetails = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("tours")
        .select("*")
        .eq("id", id)
        .single();
      if (error) console.error("error loading tour", error);
      else setTour(data);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-base">Loading tour...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-base">Tour not found.</p>
      </div>
    );
  }

  const rating = tour.rating || 0;
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const stars = [];
  for (let i = 0; i < fullStars; i++) stars.push(<span key={i}>★</span>);
  if (halfStar) stars.push(<span key="half">☆</span>);

  const parsedGallery = Array.isArray(tour.gallery)
    ? tour.gallery
    : typeof tour.gallery === "string" && tour.gallery.trim()
      ? (() => {
          try {
            const parsed = JSON.parse(tour.gallery);
            return Array.isArray(parsed)
              ? parsed
              : tour.gallery.split(",").map((item) => item.trim());
          } catch {
            return tour.gallery.split(",").map((item) => item.trim());
          }
        })()
      : [];

  /* ─────────────────────────────────────────────────────────────
     DYNAMIC ITINERARY (Commented Out) — Kept for future use
     
     Previously parsed tour.journey field to generate itinerary steps.
     Can be re-enabled by uncommenting below and updating AdminDashboard.
  ───────────────────────────────────────────────────────────── */
  // const defaultItinerarySteps = tour.journey
  //   ? tour.journey
  //       .split("\n")
  //       .map((l) => l.trim())
  //       .filter(Boolean)
  //       .map((line, idx, arr) => {
  //         const [title, subtitle = ""] = line.split("|").map((s) => s.trim());
  //         let icon = "location_on";
  //         if (idx === 0) icon = "restart_alt";
  //         if (idx === arr.length - 1) icon = "flag";
  //         return { icon, title, subtitle };
  //       })
  //   : [];

  // Now using static itinerary from lib/staticItinerary.js
  const defaultItinerarySteps = [];
  const itineraryByTourId = {};

  const galleryImages = [tour.title_image, ...parsedGallery].filter(
    (img, index, arr) => img && arr.indexOf(img) === index,
  );
  const heroImage = galleryImages[0] || "";

  return (
    <div className="scroll-smooth bg-background-light text-slate-900 font-display antialiased">
      <main className="relative pb-16 sm:pb-20">
        <div className="relative h-[54vh] min-h-[420px] sm:min-h-[480px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent z-10"></div>
          <img
            alt={tour.name}
            className="w-full h-full object-cover object-center"
            fetchpriority="high"
            width="1200"
            height="600"
            src={heroImage}
          />
          <div className="absolute bottom-0 left-0 w-full z-20 pb-8 sm:pb-10 pt-20 sm:pt-24 bg-gradient-to-t from-background-dark/90 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="bg-primary text-white text-[10px] sm:text-xs font-bold px-2.5 sm:px-3 py-1 rounded-full uppercase tracking-wide">
                      {tour.category}
                    </span>
                    <span className="flex items-center text-white/90 text-xs sm:text-sm font-medium bg-white/20 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full">
                      <span className="material-icons text-yellow-400 text-xs sm:text-sm mr-1">
                        star
                      </span>
                      {rating.toFixed(1)} ({tour.review_count || 0} Reviews)
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2.5 sm:mb-3 text-balance leading-tight">
                    {tour.name}
                  </h1>
                  <div className="relative max-w-xl">
                    <p
                      className={
                        "text-sm sm:text-base text-white/90 font-medium " +
                        (showFullDescription ? "" : "line-clamp-2")
                      }
                    >
                      {tour.details}
                    </p>
                    {tour.details && tour.details.length > 120 && (
                      <button
                        className="mt-1 text-xs text-primary font-bold underline focus:outline-none"
                        onClick={() => setShowFullDescription((v) => !v)}
                      >
                        {showFullDescription ? "Read Less" : "Read More"}
                      </button>
                    )}
                  </div>
                </div>
                <div className="md:hidden w-full">
                  <Link
                    to={`/booking?tourId=${id}`}
                    className="block w-full bg-primary text-white py-3 rounded-xl text-sm font-bold shadow-xl shadow-primary/30 text-center"
                  >
                    Check Availability
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 sm:mt-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            <div className="lg:col-span-8 space-y-10 sm:space-y-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 p-4 sm:p-6 bg-surface-light rounded-2xl shadow-sm border border-primary/5">
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <span className="material-icons text-primary text-xl mb-1.5 sm:mb-2">
                    schedule
                  </span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Duration
                  </span>
                  <span className="text-slate-900 text-sm sm:text-base font-bold">
                    {tour.duration} Hours
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 border-l border-slate-100">
                  <span className="material-icons text-primary text-xl mb-1.5 sm:mb-2">
                    groups
                  </span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Group
                  </span>
                  <span className="text-slate-900 text-sm sm:text-base font-bold">
                    Private Tour
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 border-l border-slate-100">
                  <span className="material-icons text-primary text-xl mb-1.5 sm:mb-2">
                    translate
                  </span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Language
                  </span>
                  <span className="text-slate-900 text-sm sm:text-base font-bold">
                    English
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 border-l border-slate-100">
                  <span className="material-icons text-primary text-xl mb-1.5 sm:mb-2">
                    hiking
                  </span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Activity
                  </span>
                  <span className="text-slate-900 text-sm sm:text-base font-bold">
                    {tour.activity || ""}
                  </span>
                </div>
              </div>

              <div className="lg:hidden bg-surface-light rounded-2xl shadow-xl border border-primary/10 overflow-hidden">
                <div className="bg-primary/5 p-3 sm:p-4 flex justify-between items-center border-b border-primary/10">
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs text-slate-400 font-medium">
                        From
                      </span>
                      <span className="text-xl sm:text-2xl font-bold text-slate-900">
                        €{tour.price}
                      </span>
                      <span className="text-slate-500 text-xs sm:text-sm font-medium">
                        / person
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Group discounts up to 30% off
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold mb-1">
                      Flexible Booking
                    </span>
                  </div>
                </div>
                <div className="p-4 sm:p-5">
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Duration</span>
                      <span className="font-bold text-slate-900">
                        {tour.duration} Hours
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Guide</span>
                      <span className="font-bold text-slate-900">
                        Entertainment Mama
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-slate-100">
                      <span className="text-sm text-slate-600">Language</span>
                      <span className="font-bold text-slate-900">English</span>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <Link
                      className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm sm:text-base shadow-xl shadow-primary/30 hover:bg-orange-600 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                      to={`/booking?tourId=${id}`}
                    >
                      Proceed to Booking
                    </Link>
                    <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                      <span className="material-icons text-sm text-green-500">
                        verified_user
                      </span>
                      Free cancellation up to 24h before
                    </p>

                    <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                      <span className="material-icons text-sm text-blue-500">
                        payment
                      </span>
                      Reserve now & pay later
                    </p>
                  </div>
                </div>
              </div>

              <section>
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="p-4 sm:p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="material-icons text-primary text-2xl sm:text-3xl mr-2">
                        star
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Highlights
                      </h3>
                    </div>
                    <ul className="text-slate-600 text-sm list-disc pl-5 space-y-1">
                      <li>
                        Feel the wind in your hair as you explore Lisbon in a
                        tuk-tuk
                      </li>
                      <li>
                        Discover the city's most iconic landmarks and hidden
                        gems
                      </li>
                      <li>
                        Enjoy panoramic views of the city from Miradouro da
                        Senhora do Monte
                      </li>
                      <li>
                        See the Jerónimos Monastery, Belém Tower, and Monument
                        to the Discoveries
                      </li>
                      <li>
                        Pass and stop by the Lisbon Cathedral and Praça do
                        Comércio
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="material-icons text-primary text-2xl sm:text-3xl mr-2">
                        check_circle
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Includes
                      </h3>
                    </div>
                    <ul className="text-slate-600 text-sm pl-0 space-y-1">
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to LX Factory
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to Jerónimos Monastery
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to Torre de Belem
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to Monument to the Discoveries
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to Alfama
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to Miradouro de Santa Luzia
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to Mosteiro de Sao Vicente de Fora
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to National Pantheon
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-green-500 text-base">
                          check
                        </span>
                        Visit to Miradouro da Senhora do Monte
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-orange-500 text-base">
                          cancel
                        </span>
                        Entrance fees to attractions
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="material-icons text-orange-500 text-base">
                          cancel
                        </span>
                        Food and drinks
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="material-icons text-primary text-2xl sm:text-3xl mr-2">
                        block
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Not suitable for
                      </h3>
                    </div>
                    <ul className="text-slate-600 text-sm list-disc pl-5 space-y-1">
                      <li>Children under 7 years</li>
                      <li>People with mobility impairments</li>
                      <li>Wheelchair users</li>
                    </ul>
                  </div>

                  <div className="p-4 sm:p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <span className="material-icons text-primary text-2xl sm:text-3xl mr-2">
                        info
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Important Information
                      </h3>
                    </div>
                    <div className="mb-2">
                      <h4 className="text-base sm:text-md font-bold text-slate-900 mb-1">
                        Not Allowed
                      </h4>
                      <ul className="text-slate-600 text-sm list-disc pl-5 space-y-1">
                        <li>Baby strollers</li>
                        <li>Luggage or large bags</li>
                        <li>Electric wheelchairs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-base sm:text-md font-bold text-slate-900 mb-1">
                        Know Before You Go
                      </h4>
                      <ul className="text-slate-600 text-sm list-disc pl-5 space-y-1">
                        <li>
                          Some attractions are passed by without stopping.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              <TourItinerary
                tourId={id}
                defaultTitle={STATIC_ITINERARY_CONFIG.title}
                defaultSteps={STATIC_ITINERARY_CONFIG.steps}
                itineraryByTourId={itineraryByTourId}
              />

              <section className="lg:hidden" id="tour-meeting-location">
                <div className="bg-surface-light rounded-xl overflow-hidden shadow-lg border border-slate-100 p-4">
                  <MeetingPoints compact />
                </div>
              </section>

              <section className="lg:hidden">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                  <div className="flex gap-3">
                    <span className="material-icons text-blue-500">info</span>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">
                        Wear comfy shoes!
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Lisbon is hilly and the cobblestones can be slippery.
                        Heels are not recommended for this tour.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <GalleryScroller images={galleryImages} />
              </section>

              <RecommendedTours currentTourId={id} limit={3} />

              {/* <section className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-5 sm:p-8 opacity-5 pointer-events-none">
                  <span className="material-icons text-9xl text-primary">
                    format_quote
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 mb-6 sm:mb-10 relative z-10">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2.5 sm:gap-3">
                      Guest Reviews
                      <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                        <span className="material-icons text-sm">
                          verified_user
                        </span>
                        Verified Guest
                      </span>
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-yellow-400 text-lg sm:text-xl">
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                      </div>
                      <span className="text-slate-600 text-sm sm:text-base font-medium">
                        4.98 average rating
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2.5 sm:px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium border border-slate-200">
                      Local Expert
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium border border-slate-200">
                      Friendly
                    </span>
                    <span className="px-2.5 sm:px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs sm:text-sm font-medium border border-slate-200">
                      Great Storyteller
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 relative z-10">
                  <div className="bg-background-light p-5 rounded-xl border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          ML
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Milly
                          </h4>
                          <p className="text-xs text-slate-500">October 2023</p>
                        </div>
                      </div>
                      <span className="material-icons text-primary/20">
                        format_quote
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      "Mama is an absolute gem! This tour was the highlight of
                      our trip. He showed us spots we never would have found on
                      our own. The bakery stop was incredible."
                    </p>
                    <div className="flex gap-2">
                      <img
                        alt="Review photo thumbnail"
                        className="w-16 h-16 rounded-lg object-cover border border-white shadow-sm"
                        loading="lazy"
                        decoding="async"
                        width="64"
                        height="64"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBF04WMttcxjV33MoxrLc6K1y0z72j0ZgWqomm-GrKM7iK4xRYUk8z7kqSptFm8sA5SOXFeMFDO0zsStcp-kOCzHT0xW21bNLPxyi-HwbNIDxSoCgKT9vUOEI2NzR8fEo_xCf5uzbpdcz-BaVupB0FmBq8-YuRcV0880NXFQl7PvEIKvN4te_13qk_E7L8uE7diN_p-khkTBTHzh9KGcrQ4Hbp5aVN24JqeZjmaFWB53hr_QLhvagxKdnEstLF6nWM1HjgHe6K1ww"
                      />
                    </div>
                  </div>
                  <div className="bg-background-light p-5 rounded-xl border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                          SM
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Sarah Miller
                          </h4>
                          <p className="text-xs text-slate-500">
                            September 2023
                          </p>
                        </div>
                      </div>
                      <span className="material-icons text-primary/20">
                        format_quote
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      "If you want to avoid the tourist traps, this is the tour
                      for you. The small group size made it feel so personal.
                      Mamas's stories about growing up here were fascinating."
                    </p>
                  </div>
                  <div className="bg-background-light p-5 rounded-xl border border-slate-100 hidden md:block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          alt="Reviewer avatar"
                          className="w-10 h-10 rounded-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDuAXHWlPXvc2L9PxIkuYoXcuK8Qmg1e6NvIlcBWvUrW_wvj7LSgIQcuh5omthDujEnsQ7Ri4Q6G0POwAID1BuwmN-uIU8IX-vLKh1uqOKyqqVtfE7R5CtleUSXHD7OQk7x5rlDLRSp7l494gClWILkMdFuhR4EXI2NSLuGpO98ePYxz_Ing6prNKkZccjRPXBSQJlyiJcVM3sKUnD8JRXsyOWcd6Ngf5PU9GSW__6Hn8VWSnu01HY4RYdycylM-Nt4pY9VwzksQ"
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Emma &amp; Tom
                          </h4>
                          <p className="text-xs text-slate-500">August 2023</p>
                        </div>
                      </div>
                      <span className="material-icons text-primary/20">
                        format_quote
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "The sunset view from the private terrace was magical.
                      Highly recommend wearing comfortable shoes as advertised,
                      but every step was worth it!"
                    </p>
                  </div>
                  <div className="bg-background-light p-5 rounded-xl border border-slate-100 hidden md:block">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                          RL
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            Robert L.
                          </h4>
                          <p className="text-xs text-slate-500">July 2023</p>
                        </div>
                      </div>
                      <span className="material-icons text-primary/20">
                        format_quote
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      "Authentic is the right word. No scripts, just passion. We
                      felt like we were visiting a friend in Lisbon."
                    </p>
                  </div>
                </div>
                <div className="text-center relative z-10">
                  <Link
                    to="/guest-stories"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-900 font-bold hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    See all 150+ reviews
                    <span className="material-icons text-sm">
                      arrow_forward
                    </span>
                  </Link>
                </div>
              </section> */}
            </div>

            <div className="lg:col-span-4 relative">
              <div className="sticky top-24 space-y-4 sm:space-y-6">
                <div className="hidden lg:block bg-surface-light rounded-2xl shadow-xl border border-primary/10 overflow-hidden">
                  <div className="bg-primary/5 p-3 sm:p-4 flex justify-between items-center border-b border-primary/10">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs text-slate-400 font-medium">
                          From
                        </span>
                        <span className="text-xl sm:text-2xl font-bold text-slate-900">
                          €{tour.price}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">
                          / person
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Group discounts up to 30% off
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold mb-1">
                        Flexible Booking
                      </span>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <span className="material-icons text-blue-500 text-lg sm:text-xl mt-0.5">
                          lock_clock
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-blue-900">
                            Private Group Tour
                          </h4>
                          <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                            You are booking the guide exclusively for your
                            group. The price adjusts based on group size.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Duration</span>
                        <span className="font-bold text-slate-900">
                          {tour.duration} Hours
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Guide</span>
                        <span className="font-bold text-slate-900">
                          Entertainment Mama
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Language</span>
                        <span className="font-bold text-slate-900">
                          English
                        </span>
                      </div>
                    </div>
                    <div className="mt-6 sm:mt-8">
                      <Link
                        className="w-full bg-primary text-white py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-primary/30 hover:bg-orange-600 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                        to={`/booking?tourId=${id}`}
                      >
                        Proceed to Booking
                        <span className="material-icons group-hover:translate-x-1 transition-transform">
                          calendar_month
                        </span>
                      </Link>
                      <div className="flex flex-col gap-1 mt-3">
                        <div className="flex items-center justify-center gap-1">
                          <span className="material-icons text-xs text-green-500">
                            verified_user
                          </span>
                          <span className="text-[11px] sm:text-xs">
                            Free cancellation up to 24h before
                          </span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <span className="material-icons text-xs text-blue-500">
                            payments
                          </span>
                          <span className="text-[11px] sm:text-xs">
                            Reserve now & pay later
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="hidden lg:block bg-surface-light rounded-xl overflow-hidden shadow-lg border border-slate-100 p-4"
                  id="tour-meeting-location"
                >
                  <MeetingPoints />
                </div>

                <div className="hidden lg:block bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                  <div className="flex gap-3">
                    <span className="material-icons text-blue-500">info</span>
                    <div>
                      <h4 className="text-sm font-bold text-blue-900">
                        Wear comfy shoes!
                      </h4>
                      <p className="text-xs text-blue-700 mt-1">
                        Lisbon is hilly and the cobblestones can be slippery.
                        Heels are not recommended for this tour.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TourDetails;
