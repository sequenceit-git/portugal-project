const GuestStories = () => {
  const stories = [
    {
      id: 1,
      type: "featured",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAvlabtSUdhHWu0IltA3OHHHgXJoV5bTRV035RLcGKy1LHrOydhPZxSacALHvJPDsjNoDqxOTKRqcnIe6Qw9zjQ5H2cmSxpB9Y5yQQp6UdpZUJIfPfvpP58LiZRyJMmIj-eVzfBHzMHhyI2LagnZd_Q4vouiJIb4pWaJLzyluk3dQMY9aO3aGoUuFe9jUhNvJ-4Du4RDXhRhkTXvmpKH3KoE3Jl8V4wf3N2v_U7mqVRHCUv5tUbvD-U9ABi7FknoHbwT_Ha2eheZw",
      category: "Couples Tour",
      quote: '"The highlight of our European trip!"',
      review:
        '"Manuel knew every secret spot in Alfama. We tried the best Ginjinha and saw views we would have never found on our own. Highly recommend!"',
      author: "Sarah & Tom",
      location: "USA",
      rating: 5,
    },
    {
      id: 2,
      type: "quote",
      quote:
        '"I was traveling solo and a bit nervous, but this tour felt like walking around with an old friend. The history of the earthquake was fascinating."',
      author: "Elena R.",
      location: "Solo Traveler • Canada",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBVN8H6BF8PyfnTtEXUvHgwiJo1P1CCKSgqmeO8OOkZwSHkFigaT3dzW5MTBkOOlMOUsHXQHgVEYeeCRTE50NXA9FeIYk9llo6V5ners5DxkMxDKAFw2tkDXwEVl3Gt6ryeL0GlHKaZmxxms_YHhYqiXlcl_xpMoOARmEjxSQYddnTFWNYRX4fcn7WF3kxt6XHLuXoryrXFNUQt_2bsUyS4rbs9N-bl87AHJF0zLeOr4iSx4_ZwCZFSTMveZKEeb8h3IaMzWtg_kA",
      rating: 5,
    },
    {
      id: 3,
      type: "landscape",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBSH0hw8MFnQFO2-L-gjTNlU0vtYnUfCKxt4DeC2YMhA-MjmjLsJBgGMJ83gFEzeQocSYi7CgKJE6rDxUxCW-zXFTq9y3xMOcuMtCkBjBt5_cB2Oj0Gf5JI7LBqaJpVeCPFwxlF9UwVuiwJ5GOFNPSfj2vk-nF0Z3Mc_jh0jZoJH-104zDyX8hUBhJaAOergpd3i6MarYHwxhFFuzqGZy8LkOW3-6sL26JyEg03b-8swpucTZvvsKq732E60ETQC-EfBJjVtq0jJQ",
      location: "Tram 28",
      title: '"Better than any guidebook"',
      review: "Review via TripAdvisor • Oct 2023",
      rating: 5,
    },
    {
      id: 4,
      type: "family",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA7tFx4Vs3un_lRJ6lMe0q8uJmriBvvxBHKGYWXAkwgq6wLa2OG2R8cKj3JnrOy7axS7nKBmQ3Gi3x_OX2VW6YE-Shxjhhh0iJBCpJbktIxlq_oFaIrGW_WRUPOVHDQX6VYZMczB11cBnnINakI4d9_q4a28Un5JGXTB6M3WzlBd1oi-ZjMDDZkpghNu0vE_gR3-_MhVySi6neC4CdT-fJpLLAfi3Bh3xQzK7IKaMIPhCLgidvv7IpFFMIHCWm_ekPuror6l0Qjaw",
      review:
        '"We were a big group with kids and grandparents. The tuk-tuk ride was comfortable for everyone and super fun! The kids loved the stories."',
      author: "The Janssen Family",
      location: "Germany",
      rating: 5,
    },
    {
      id: 5,
      type: "food",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAFwtnrVSuBla8YRsuot9fZ7X_Y4w2ipMyr3esvYYYLaPXS6pggsJuWVKONvscVZu4TSG4VmeGV0ZIcoOcl-q1knkVI1QTIi6_nZJhlGO9ny3UP8DkBrUcp2ABDZirF2pjh_cclakv6xHtGuQr8KbpSraDTc_Mx31iZW6-eSGI7kX_tUjfQyFmfO7juQLyDD12V3FNzNJgooo1WNlraLDjOiAV5ZeAGZY6nhRWdMjYyj5LKqzXUicZQGmp3G_qGqSilbNy82nfy2w",
      title: '"A Foodie\'s Dream"',
      review:
        "Not just history, but a culinary adventure. We stopped at a hidden bakery that had the best tarts in town.",
      author: "Marcus D.",
      location: "UK",
      rating: 5,
    },
    {
      id: 6,
      type: "sunset",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuALKvHFowvHXG9UVOmaMMeAeOOSAKU79-C9gnKxaQ751vMZ92utGYs455WXTTzKSbI4EAVbosc3mm2l02TmMs_Cz4BDi_7C8YuqWPuikS5TJImYFqelMMjuL_qqeASJ4XD9gu5pj1R6khbmOmR8Hp7DCBJ1uL-FL3W2vwRpNDEvQeBkTOSd_sNooGB-8LG5l4qdJb0lZ5zWpcxQl6swY0Aq5vsQkBvF5tsHWYn8VyUi2V6dtJss3fcE_f8SGNKy3wbdUyzR6gBdWw",
      title: "Sunset Tour",
      review:
        '"The view from the secret miradouro was breathtaking. Perfect end to our honeymoon."',
      author: "Jessica & Mark",
      rating: 5,
    },
    {
      id: 7,
      type: "short",
      title: '"Simply the best guide in Lisbon."',
      review: "Reviewed on Google Reviews",
      author: "Andrew K.",
      rating: 5,
    },
    {
      id: 8,
      type: "tuktuk",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBlWyJtQ3Do0M7A5MVpi37o8YQdergrKEW5AW6W14dPaggD_2sAtMQWxsezQHmQCwUP0rmOCvraPGIrtOPxcqHoNTZQtc03VMKka6KqiOQHSmpOTmiMO_V_4XsK8VlhUrcyyzhgOasAgwoV4gQwIVpORYBaQt3BUrXdbP2j5V3OzZ5wypaIcA7uCh0voEF2unqI7ahoNpq6-1OFtR8DZ21wXvmMV_it9WAMQrQYzCfpjd1pJAmMhjFvjC1RwDb-oP1DrE0Ot8h8Bw",
      review:
        '"Navigating the steep hills was a breeze in the Tuk Tuk. It\'s the only way to see the old town!"',
      author: "The Peterson Family",
      badge: "Family Tour",
    },
  ];

  const renderStars = (rating) => {
    return Array.from({ length: rating }).map((_, i) => (
      <span key={i} className="material-icons text-primary text-sm">
        star
      </span>
    ));
  };

  return (
    <div className="bg-background-light text-gray-800 font-display antialiased">
      {/* Hero Section */}
      <header className="relative pt-32 pb-16 lg:pt-40 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-wider uppercase mb-4">
            Guest Book
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            Memories Made in{" "}
            <span className="text-primary underline decoration-4 decoration-primary/30 underline-offset-4">
              Lisbon
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed">
            Join hundreds of happy travelers who explored the hidden gems,
            tasted the best pastéis, and felt the soul of the city with me.
          </p>

          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-3xl font-bold text-gray-900">4.9</span>
                <div className="flex text-primary">{renderStars(5)}</div>
              </div>
              <span className="text-sm font-medium text-gray-500">
                Based on 500+ reviews
              </span>
            </div>
            <div className="h-12 w-px bg-gray-300 hidden sm:block"></div>
            <div className="flex gap-6 items-center opacity-80 hover:opacity-100 transition-all duration-300">
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-xs font-bold text-gray-500">
                  Certificate of Excellence
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="hidden lg:inline text-xs font-bold text-gray-500">
                  Top Rated Guide
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Filter Tabs */}
        <div className="flex justify-center mb-12 gap-2 overflow-x-auto py-2">
          <button className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md whitespace-nowrap">
            All Stories
          </button>
          <button className="bg-white text-gray-600 border border-gray-200 px-5 py-2 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
            Couples
          </button>
          <button className="bg-white text-gray-600 border border-gray-200 px-5 py-2 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
            Families
          </button>
          <button className="bg-white text-gray-600 border border-gray-200 px-5 py-2 rounded-full text-sm font-medium hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
            Solo Travelers
          </button>
        </div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
          {stories.map((story) => (
            <div key={story.id} className="break-inside-avoid">
              {/* Featured Card */}
              {story.type === "featured" && (
                <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="relative h-96 overflow-hidden">
                    <img
                      alt="Guest story"
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      src={story.image}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <span className="text-white text-xs font-bold bg-primary px-2 py-1 rounded mb-2 inline-block">
                        {story.category}
                      </span>
                      <h3 className="text-white font-bold text-lg">
                        {story.quote}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {story.review}
                    </p>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                          {story.author
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">
                            {story.author}
                          </p>
                          <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                            {story.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex">{renderStars(story.rating)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quote Card */}
              {story.type === "quote" && (
                <div className="bg-primary/5 rounded-xl p-8 border border-primary/10 relative">
                  <span className="material-icons text-6xl text-primary/10 absolute top-4 left-4">
                    format_quote
                  </span>
                  <p className="relative z-10 text-lg font-medium text-gray-800 italic mb-6">
                    {story.quote}
                  </p>
                  <div className="flex items-center gap-4 relative z-10">
                    <img
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
                      src={story.image}
                      alt={story.author}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {story.author}
                      </p>
                      <p className="text-xs text-gray-500">{story.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Landscape Card */}
              {story.type === "landscape" && (
                <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      src={story.image}
                      alt="Tour moment"
                    />
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <span className="material-icons text-primary text-xs">
                        location_on
                      </span>
                      {story.location}
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex mb-2">{renderStars(story.rating)}</div>
                    <h4 className="font-bold text-gray-900 mb-2">
                      {story.title}
                    </h4>
                    <p className="text-xs text-gray-500">{story.review}</p>
                  </div>
                </div>
              )}

              {/* Family Card */}
              {story.type === "family" && (
                <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      src={story.image}
                      alt="Family tour"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white/90 italic mb-4 line-clamp-3">
                          {story.review}
                        </p>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white text-primary flex items-center justify-center font-bold text-xs">
                            JF
                          </div>
                          <div className="text-white">
                            <p className="text-xs font-bold">{story.author}</p>
                            <p className="text-[10px] opacity-80">
                              {story.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Food Card */}
              {story.type === "food" && (
                <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      src={story.image}
                      alt="Food experience"
                    />
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-gray-900 mb-2 text-lg">
                      {story.title}
                    </h4>
                    <p className="text-gray-600 text-sm mb-4">{story.review}</p>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                        MD
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {story.author}
                      </span>
                      <span className="text-xs text-gray-400">
                        • {story.location}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sunset Card */}
              {story.type === "sunset" && (
                <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
                  <div className="relative h-80 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      src={story.image}
                      alt="Sunset view"
                    />
                    <div className="absolute top-4 left-4 bg-primary/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {story.title}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-background-dark to-transparent">
                      <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/10">
                        <p className="text-white text-sm font-medium italic">
                          {story.review}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-white/80 font-bold">
                            {story.author}
                          </span>
                          <div className="flex">
                            {renderStars(story.rating)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Short Card */}
              {story.type === "short" && (
                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-1 mb-3">
                    {renderStars(story.rating)}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">
                    {story.title}
                  </h4>
                  <p className="text-xs text-gray-500 mb-4">{story.review}</p>
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      A
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {story.author}
                    </span>
                  </div>
                </div>
              )}

              {/* Tuk Tuk Card */}
              {story.type === "tuktuk" && (
                <div className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 grayscale group-hover:grayscale-0 transition-all"
                      src={story.image}
                      alt="Tuk tuk tour"
                    />
                  </div>
                  <div className="p-5">
                    <p className="text-gray-600 text-sm leading-relaxed italic mb-4">
                      {story.review}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs font-bold text-gray-900">
                        {story.author}
                      </p>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {story.badge}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors border-b-2 border-transparent hover:border-primary pb-1">
            Load more stories
            <span className="material-icons text-sm">arrow_downward</span>
          </button>
        </div>
      </main>

      {/* CTA Section */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="mb-8">
            <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <span className="material-icons text-3xl">calendar_today</span>
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
              Ready to create your own story?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Dates fill up quickly, especially during summer. Check
              availability now to secure your personal tour of Lisbon.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="w-full sm:w-auto bg-primary hover:bg-orange-600 text-white text-lg font-bold py-4 px-10 rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
              Join the next tour
              <span className="material-icons">arrow_forward</span>
            </button>
            <button className="w-full sm:w-auto bg-transparent border-2 border-gray-200 hover:border-primary text-gray-700 hover:text-primary font-bold py-3.5 px-8 rounded-xl transition-colors">
              Contact me
            </button>
          </div>
          <p className="mt-6 text-sm text-gray-400 flex items-center justify-center gap-1">
            <span className="material-icons text-xs">check_circle</span>
            Free cancellation up to 24 hours before the tour.
          </p>
        </div>
      </section>
    </div>
  );
};

export default GuestStories;
