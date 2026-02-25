import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import GalleryScroller from "../components/GalleryScroller";
import { Link } from "react-router-dom";

const TourDetails = () => {
  const { id } = useParams();
  const [tour, setTour] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <p className="text-lg">Loading tour...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">Tour not found.</p>
      </div>
    );
  }

  const rating = tour.rating || 0;
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  const stars = [];
  for (let i = 0; i < fullStars; i++) stars.push(<span key={i}>★</span>);
  if (halfStar) stars.push(<span key="half">☆</span>);

  return (
    <div className="scroll-smooth bg-background-light text-slate-900 font-display antialiased">
      <main className="relative pb-24">
        <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent z-10"></div>
          <img
            alt={tour.name}
            className="w-full h-full object-cover object-center"
            src={tour.gallery?.[0] || ""}
          />
          <div className="absolute bottom-0 left-0 w-full z-20 pb-12 pt-24 bg-gradient-to-t from-background-dark/90 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-3xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                      {tour.category}
                    </span>
                    <span className="flex items-center text-white/90 text-sm font-medium bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="material-icons text-yellow-400 text-sm mr-1">
                        star
                      </span>
                      {rating.toFixed(1)} ({tour.review_count || 0} Reviews)
                    </span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 text-balance leading-tight">
                    {tour.name}
                  </h1>
                  <p className="text-lg text-white/90 max-w-xl font-medium">
                    {tour.details}
                  </p>
                </div>
                <div className="md:hidden w-full">
                  <button className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-xl shadow-primary/30">
                    Check Availability
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-surface-light rounded-2xl shadow-sm border border-primary/5">
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <span className="material-icons text-primary mb-2">
                    schedule
                  </span>
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                    Duration
                  </span>
                  <span className="text-slate-900 font-bold">
                    {tour.duration} Hours
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 border-l border-slate-100">
                  <span className="material-icons text-primary mb-2">
                    groups
                  </span>
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                    Group Size
                  </span>
                  <span className="text-slate-900 font-bold">
                    Up to {tour.people}
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 border-l border-slate-100">
                  <span className="material-icons text-primary mb-2">
                    translate
                  </span>
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                    Language
                  </span>
                  <span className="text-slate-900 font-bold">English</span>
                </div>
                <div className="flex flex-col items-center justify-center text-center p-2 border-l border-slate-100">
                  <span className="material-icons text-primary mb-2">
                    hiking
                  </span>
                  <span className="text-sm text-slate-500 font-medium uppercase tracking-wide">
                    Activity
                  </span>
                  <span className="text-slate-900 font-bold">
                    {tour.activity || ""}
                  </span>
                </div>
              </div>

              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">
                    Why I created this tour
                  </h2>
                  <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-slate-900 leading-tight">
                        Marco Silva
                      </p>
                      <p className="text-xs text-primary font-bold uppercase tracking-wide">
                        Verified Local Guide
                      </p>
                    </div>
                    <img
                      alt="Portrait of a smiling man with a beard"
                      className="w-14 h-14 rounded-full object-cover border-2 border-primary p-0.5"
                      data-alt="Portrait of a smiling man with a beard"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqCNAv-dhb4J-nE-vMuzmbSzYc1TJw3fvkBrm-F3x2hnpkNajUP2I5khETCKk_J0GxxRWkq9EKne_FRNDykVYw9BvqTFWe22tl2mrlmKUxdszTshx-Cl7AVnEENEvNJVcSAi1WDBV2SdAh95jnBaSRYL2qOEJ_dwOYlhznq8fmsRkaCooAbqA2JdRmbIledWq0z4VkXFDi_5TruOPHN7Ov5bt77JuD2i3gE9WvIBl8PogqF6_4Yhkj-v2R8qgHQvBCGOZgU1pp1A"
                    />
                  </div>
                </div>
                <div className="prose prose-lg text-slate-600 max-w-none">
                  <p className="mb-6 leading-relaxed">
                    I was born in a small apartment overlooking the Tagus river,
                    right here in Alfama. Growing up, these winding streets were
                    my playground. But recently, I noticed something that broke
                    my heart: visitors were walking right past the real magic of
                    my neighborhood.
                  </p>
                  <div className="my-10 pl-8 border-l-4 border-primary/40 italic text-xl text-slate-800 font-medium">
                    "I wanted to show you the Lisbon that guidebook writers
                    miss. The smell of fresh laundry in the alleys, the hidden
                    community gardens, and the elderly neighbor who still sings
                    fado from her window."
                  </div>
                  <p className="mb-6 leading-relaxed">
                    This isn't a history lecture. It's a walk with a friend.
                    We'll dodge the crowded tourist trams and instead take the
                    stairs locals use. I'll introduce you to Sr. Antonio, who
                    bakes the best bread in the district (and hates the
                    internet), and we'll end at a secret viewpoint that isn't on
                    Google Maps. This tour is my love letter to the Lisbon that
                    raised me.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  What makes this tour different
                </h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4">
                      <span className="material-icons text-primary">
                        record_voice_over
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Strictly Local, No Scripts
                    </h3>
                    <p className="text-slate-600 text-sm">
                      No memorized speeches. Just real stories from a local's
                      perspective, adapting to what we see on the street that
                      day.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4">
                      <span className="material-icons text-primary">
                        vpn_key
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Exclusive Access
                    </h3>
                    <p className="text-slate-600 text-sm">
                      I hold the keys to a private terrace in Mouraria that is
                      normally closed to the public. The view is unforgettable.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4">
                      <span className="material-icons text-primary">
                        groups
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Private Experience
                    </h3>
                    <p className="text-slate-600 text-sm">
                      This is a private tour for your group only. You get the
                      guide's full attention and can adjust the pace as needed.
                    </p>
                  </div>
                  <div className="p-6 rounded-xl bg-orange-50 border border-primary/10">
                    <div className="bg-white w-12 h-12 rounded-lg flex items-center justify-center shadow-sm mb-4">
                      <span className="material-icons text-primary">
                        bakery_dining
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Authentic Tastes
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Includes a stop for warm Pastel de Nata and a Ginjinha
                      shot at places locals actually frequent.
                    </p>
                  </div>
                </div>
              </section>

              <section className="relative">
                <h2 className="text-2xl font-bold text-slate-900 mb-8">
                  The Journey
                </h2>
                <div className="absolute left-8 top-20 bottom-10 w-0.5 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/10" />
                <div className="space-y-10">
                  {tour.journey &&
                    tour.journey.map((step, idx) => {
                      const icons = [
                        "place",
                        "bakery_dining",
                        "museum",
                        "restaurant",
                        "directions_walk",
                      ];
                      return (
                        <div key={idx} className="relative flex gap-6 group">
                          <div className="flex-none w-16 flex flex-col items-center z-10">
                            <div className="w-10 h-10 rounded-full bg-white border-2 border-primary flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                              <span className="material-icons text-primary text-sm">
                                {icons[idx % icons.length]}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1 bg-surface-light p-6 rounded-xl shadow-sm border border-slate-100 hover:border-primary/30 transition-colors">
                            <h3 className="text-lg font-bold text-slate-900">
                              {step}
                            </h3>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Guest Moments
                </h2>
                <GalleryScroller images={tour.gallery || []} />
              </section>

              <section className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                  <span className="material-icons text-9xl text-primary">
                    format_quote
                  </span>
                </div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 relative z-10">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                      Guest Reviews
                      <span className="bg-green-100 text-green-700 text-xs px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                        <span className="material-icons text-sm">
                          verified_user
                        </span>
                        Verified Guest
                      </span>
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex text-yellow-400 text-xl">
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                        <span className="material-icons">star</span>
                      </div>
                      <span className="text-slate-600 font-medium">
                        4.98 average rating
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                      Local Expert
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                      Friendly
                    </span>
                    <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                      Great Storyteller
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8 relative z-10">
                  <div className="bg-background-light p-5 rounded-xl border border-slate-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          JD
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">
                            John Doe
                          </h4>
                          <p className="text-xs text-slate-500">October 2023</p>
                        </div>
                      </div>
                      <span className="material-icons text-primary/20">
                        format_quote
                      </span>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-4">
                      "Marco is an absolute gem! This tour was the highlight of
                      our trip. He showed us spots we never would have found on
                      our own. The bakery stop was incredible."
                    </p>
                    <div className="flex gap-2">
                      <img
                        alt="Review photo thumbnail"
                        className="w-16 h-16 rounded-lg object-cover border border-white shadow-sm"
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
                      Marco's stories about growing up here were fascinating."
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
                  <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-full text-slate-900 font-bold hover:bg-slate-50 transition-colors shadow-sm">
                    See all 150+ reviews
                    <span className="material-icons text-sm">
                      arrow_forward
                    </span>
                  </button>
                </div>
              </section>
            </div>

            <div className="lg:col-span-4 relative">
              <div className="sticky top-24 space-y-6">
                <div className="bg-surface-light rounded-2xl shadow-xl border border-primary/10 overflow-hidden">
                  <div className="bg-primary/5 p-4 flex justify-between items-center border-b border-primary/10">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-900">
                          €{tour.price}
                        </span>
                        <span className="text-slate-500 text-sm font-medium">
                          / person
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Min 1, Max {tour.people} people
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold mb-1">
                        Flexible Booking
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
                      <div className="flex items-start gap-3">
                        <span className="material-icons text-blue-500 text-xl mt-0.5">
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
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Duration</span>
                        <span className="font-bold text-slate-900">
                          {tour.duration} Hours
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Guide</span>
                        <span className="font-bold text-slate-900">
                          Marco Silva
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-slate-100">
                        <span className="text-sm text-slate-600">Language</span>
                        <span className="font-bold text-slate-900">
                          English
                        </span>
                      </div>
                    </div>
                    <div className="mt-8">
                      <Link  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-orange-600 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group" to="/booking">
                        Check Availability
                        <span className="material-icons group-hover:translate-x-1 transition-transform">
                          calendar_month
                        </span>
                      </Link>
                      <p className="text-center text-xs text-slate-500 mt-3 flex items-center justify-center gap-1">
                        <span className="material-icons text-sm text-green-500">
                          verified_user
                        </span>
                        Free cancellation up to 24h before
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-light rounded-xl overflow-hidden shadow-lg border border-slate-100">
                  <div className="h-48 relative bg-slate-200">
                    <img
                      alt="Map of Lisbon with pins"
                      className="w-full h-full object-cover opacity-80"
                      data-alt="Map of Lisbon showing tour route"
                      data-location="Lisbon"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAP6NTVQWkjpYAWfFX4ZwcAB33l9UzTuTq3rwuG_JJmjK2rMba7ZxdpWlxWQv8YYfOOrjOOnOc9CCgQYqSDKJteCYVrXnu7izYjYVAf86hq1pVZpaIZ3tdfHWrY2Og7RYcfF4KO1rV_Kg6iMnnYUS1kd81BnFlWEWwGGlP4wHFEU0vPbPh6G2lDV8z70jm03E79pI5Iy-piH73-jUKL4HQn9k6P3ZHv8y1VkrryW3AG8uaY9lh90yKmfQONFBmuq0lx0yspywV8ew"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button className="bg-white text-slate-900 px-4 py-2 rounded-full shadow-lg text-sm font-bold hover:scale-105 transition-transform">
                        View Route Map
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      Meeting Point
                    </h4>
                    <p className="text-slate-600 text-xs">
                      Miradouro da Graça (Near the Kiosk). Look for Marco
                      holding an Orange umbrella.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
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

      <footer className="bg-surface-light border-t border-slate-200 pt-16 pb-8 mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-icons text-primary text-2xl">
                  explore
                </span>
                <span className="text-lg font-bold text-slate-900">
                  Tukinlisbon
                </span>
              </div>
              <p className="text-slate-500 text-sm">
                Authentic, personal tours designed to show you the real Lisbon.
                Created by locals, loved by travelers.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Explore</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a className="hover:text-primary" href="#">
                    All Tours
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Food Tours
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Private Guide
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Day Trips
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li>
                  <a className="hover:text-primary" href="#">
                    About Us
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Our Guides
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Sustainability
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-4">Newsletter</h4>
              <p className="text-xs text-slate-500 mb-4">
                Get hidden gems sent to your inbox.
              </p>
              <div className="flex gap-2">
                <input
                  className="w-full bg-background-light border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-primary focus:border-primary"
                  placeholder="Email"
                  type="email"
                />
                <button className="bg-primary text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                  <span className="material-icons text-sm">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <p>© 2023 Tukinlisbon. All rights reserved.</p>
            <div className="flex gap-6">
              <a className="hover:text-primary" href="#">
                Privacy Policy
              </a>
              <a className="hover:text-primary" href="#">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TourDetails;
