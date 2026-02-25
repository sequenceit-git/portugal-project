import Footer from "../components/Footer";



const Home = () => {
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
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight text-gray-900 mb-6">
              Explore Lisbon with a{" "}
              <span className="text-primary relative whitespace-nowrap">
                Local
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
              , Not a Tour Company.
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

          <div className="lg:col-span-7 order-1 lg:order-2 relative h-[500px] lg:h-[700px]">
            <div className="absolute right-0 top-10 lg:top-0 w-4/5 h-full rounded-2xl overflow-hidden shadow-2xl z-10">
              <img
                alt="Friendly male tour guide in Lisbon"
                className="w-full h-full object-cover"
                data-alt="Portrait of a friendly tour guide smiling outdoors"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD2S53qR54nH-IohONcjS6-diwa-436L20ErLtDZbIIj4vONtb3lc_fWqHpyBQA7Qd0cGa4_S3TxJK-AYeltjkid4dCiirAoILB90XC0-oaZbc9EYtvms53rhQf3jZ0UHPD04E9Y7kslPEe5a072ST28112U8o_nTMdHG-mgr5ZfjbnUEkH1ZPbKsJ2aGCwu507bhsLGHhsjDlK6v3abBox4Lj6y0VAr48EodasH1kcskazsmDg2L2xiZGg3Z3_j6d4MYsbdD2i1A"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <p className="font-bold text-xl">Ricardo Silva</p>
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

      <section
        className="py-20 lg:py-28 bg-white"
        id="about"
      >
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
              "Hi, I'm Ricardo. I was born in the maze of Alfama and grew up
              chasing trams. I created{" "}
              <span className="font-semibold text-primary">Tukinlisbon</span>{" "}
              because I believe the best way to see a city is through the eyes
              of someone who loves it. No rehearsed scripts, no umbrellas in the
              air—just real stories, local flavors, and the feeling that you're
              visiting an old friend."
            </p>
            <div className="flex justify-center items-center mt-8">
              <div className="h-px w-16 bg-primary/30"></div>
              <span
                className="text-3xl text-primary mx-4 font-bold italic"
                style={{ fontFamily: "cursive" }}
              >
                Ricardo
              </span>
              <div className="h-px w-16 bg-primary/30"></div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="py-20 bg-background-light"
        id="tours"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Curated Experiences
              </h2>
              <p className="text-gray-600 max-w-xl">
                Carefully crafted itineraries designed to show you the layers of
                history, culture, and flavor that define Lisbon.
              </p>
            </div>
            <a
              className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
              href="#"
            >
              View All Tours
              <span className="material-icons text-sm">arrow_forward</span>
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group relative rounded-2xl overflow-hidden h-[500px] shadow-lg cursor-pointer">
              <img
                alt="Alfama narrow streets"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                data-alt="Narrow cobbled street in Alfama district with laundry hanging"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAmJ0loxOxE6KguDCbXrfYNEtloyjyJ0f8AA6a8mZMoVgYuCDu_hAF8lsNXQFghXM1yRMAT_E4BMzBGfjJHu_0FanXFPSSiJQ3mfmp5iDt98pRZfyx9HLCsrTPDJFWFWjMhZXNElGq9sFescUztiViyCFrr0nZvZ5Ofvr34TxfiDUCmdR33PzU-JHg1_NlJmB281uglrb2-E__Tt9vc1uTRykcJQ246FnQCoLpNM4IoET6Ei4-Tb3pXBrT1F-F7AtlxGn_XX0uZfg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-900">
                Walking
              </div>
              <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                <div className="flex items-center gap-2 text-orange-200 mb-2">
                  <span className="material-icons text-sm">schedule</span> 3
                  Hours
                  <span className="w-1 h-1 rounded-full bg-orange-200"></span>
                  <span className="material-icons text-sm">groups</span> Max 6
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Soul of Alfama
                </h3>
                <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-4">
                  Get lost in the oldest neighborhood, discover Fado houses, and
                  enjoy stunning views from hidden miradouros.
                </p>
                <span className="inline-flex items-center text-white font-bold text-sm border-b-2 border-primary pb-1">
                  Book Experience
                </span>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden h-[500px] shadow-lg cursor-pointer">
              <img
                alt="Pasteis de Nata pastries"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                data-alt="Close up of freshly baked Portuguese custard tarts"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMtTkinF52vD6ysJM6ukh79lxp7yX2RntuwrDkEgR8d9YkQuD-VkZ44X1o-L4JY3FMSDorjBe35U1Ymx8dDIbjifHcrEbHiU13GrOn9BODNaVsPzZWGVTW37NQN42bIuiWQFQl2b6xEJaWKhFqEqvZzUJ3xUHOcoGa6iMhNa8UhZrE-2qu3-qUg1npJxau7OqIYquzJySXxZazfhIGuMcme5k5A_R5Sa0y1iVyTbig2NAJAxd0MPED36ZMnxrXJu9v3azf-R28Wg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-900">
                Food &amp; Wine
              </div>
              <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                <div className="flex items-center gap-2 text-orange-200 mb-2">
                  <span className="material-icons text-sm">schedule</span> 4
                  Hours
                  <span className="w-1 h-1 rounded-full bg-orange-200"></span>
                  <span className="material-icons text-sm">restaurant</span> 5
                  Tastings
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Taste of Tradition
                </h3>
                <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-4">
                  From crispy bifanas to sweet Ginjinha, taste the authentic
                  flavors that locals line up for.
                </p>
                <span className="inline-flex items-center text-white font-bold text-sm border-b-2 border-primary pb-1">
                  Book Experience
                </span>
              </div>
            </div>

            <div className="group relative rounded-2xl overflow-hidden h-[500px] shadow-lg cursor-pointer">
              <img
                alt="Lisbon Tuk Tuk view"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                data-alt="View from a TukTuk overlooking the Lisbon city bridge"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLxkbEw9gntthXpxIdiV1VNJF10jp5hX7p2EM6NIhndsMmNLn9XIoeg7QlaFduGVgXK6km9egiMAaRTLCga_TGkfax2A0Pox2dcM3P5BNfqY3nc7x5wNqB5fHR98aPJ8qnBPDwxa1bCUtOBPev9hV2azLajkKHoWBHMnePQaJSCeM9az5OJsYjUa6FuwLkKZxIaaPmtk7X2qKADpFDW_WZr5Mocl5FSXLMNiRu_F80C3xS_2SbAYu_AAB-xkXqCJj5mYqmH-mgeg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-gray-900">
                Adventure
              </div>
              <div className="absolute bottom-0 left-0 p-8 w-full transform transition-transform duration-300 group-hover:-translate-y-2">
                <div className="flex items-center gap-2 text-orange-200 mb-2">
                  <span className="material-icons text-sm">schedule</span> 2
                  Hours
                  <span className="w-1 h-1 rounded-full bg-orange-200"></span>
                  <span className="material-icons text-sm">
                    electric_rickshaw
                  </span>
                  Private Ride
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  The 7 Hills by TukTuk
                </h3>
                <p className="text-gray-200 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 mb-4">
                  Save your legs and breeze through the steep hills of Lisbon to
                  reach the best panoramic viewpoints effortlessly.
                </p>
                <span className="inline-flex items-center text-white font-bold text-sm border-b-2 border-primary pb-1">
                  Book Experience
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center md:hidden">
            <a
              className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary-dark transition-colors"
              href="#"
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
            <div className="flex gap-2 mt-4 md:mt-0">
              <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary transition-colors bg-white">
                <span className="material-icons">arrow_back</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30">
                <span className="material-icons">arrow_forward</span>
              </button>
            </div>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="min-w-[85%] md:min-w-[400px] snap-center bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <img
                  alt="Sarah Jenkins"
                  className="w-14 h-14 rounded-full object-cover border-2 border-azulejo-light"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCJctZ2ALBWAEgWkihBhR_FUmpwmHJxLxZ6h9VOdqudXkzZKgeg_08WA0Zasco4o8w0BwD5LgHorIzQKmUNokI3FSGla5W4l22OUjw1znz_zr6IFWMFfcx_fW8hof_LYudG6zz0qfRXlUzuLjunzxcLRewDFmjWDgDcwsljk0SSlGl1UM-uNoqkuTRKFJuCUUUmqwCOL-1RqOS69YdH03zS-K4FFo_woQp9x6RIqfZanDvC9Ih1nINB6ouN72EaJ471Oi781J6m0Q"
                />
                <div>
                  <h4 className="font-bold text-gray-900">
                    Sarah Jenkins
                  </h4>
                  <p className="text-xs text-gray-500">
                    United Kingdom
                  </p>
                </div>
                <div className="ml-auto flex text-yellow-400">
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4 flex-grow">
                "Ricardo made Lisbon come alive for us! It wasn't just a tour;
                it felt like walking around with a knowledgeable friend. He took
                us to the most amazing little bakery we would have never found
                on our own."
              </p>
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <span className="text-xs font-semibold text-azulejo bg-azulejo-light px-2 py-1 rounded">
                  Tour: Soul of Alfama
                </span>
              </div>
            </div>

            <div className="min-w-[85%] md:min-w-[400px] snap-center bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <img
                  alt="Michael Chen"
                  className="w-14 h-14 rounded-full object-cover border-2 border-azulejo-light"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT7clSp0dZ45DgfaQ-zeGQ_lZ9vYQUA-mpuWs_bIMTioUTZYda0X18uOe8xVT736CkNflBHwismtHvJd00-t7wx0JrJ3aGxXQULqhMVvXwYgzhod9QjmwLUAp7yBBiHF5m7iYzV_LMXZwQKeKW0jdTRrytz_JGTgrdEOODHXzszmuKXn4ESId3Ty6oj0B3EMA0SLh1RiN9lzlFEdVwUMsBYnxttYfivccfwWFn4zvS4v1E_94WDo2qcEuI5J0hTTMq8IFetCRtHg"
                />
                <div>
                  <h4 className="font-bold text-gray-900">
                    Michael Chen
                  </h4>
                  <p className="text-xs text-gray-500">
                    Canada
                  </p>
                </div>
                <div className="ml-auto flex text-yellow-400">
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4 flex-grow">
                "The food tour was the highlight of our Europe trip. Ricardo is
                passionate about Portuguese cuisine and history. Every stop was
                delicious and meaningful. Highly recommended!"
              </p>
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <span className="text-xs font-semibold text-azulejo bg-azulejo-light px-2 py-1 rounded">
                  Tour: Taste of Tradition
                </span>
              </div>
            </div>

            <div className="min-w-[85%] md:min-w-[400px] snap-center bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all border border-gray-100 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <img
                  alt="Elena Rodriguez"
                  className="w-14 h-14 rounded-full object-cover border-2 border-azulejo-light"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuASX5uH6Zpnj-PoHiliVRUoefOIug-qIttn3s9XO3VcLq49CTcOjk9MbS1k-ZbRIf-N2fxiWCZvoEvneuJtFBgVu9z39uYhZ_ywH_aI7kUzGE-c-wWLbO_BTbdy4ny9dlXrj0gE_3PI7SbG8ZvODTne0D1nlAuYiEfqct70dQ85ZUZqBISmr-KJLHQKe2kWzgFL3UD4a7qtd8RvdXX15g9dc9X7i92RfWmtjNEhI-wY2r-eOSg_IW8FjjWpfEVp_wHl3V28pIFv1A"
                />
                <div>
                  <h4 className="font-bold text-gray-900">
                    Elena Rodriguez
                  </h4>
                  <p className="text-xs text-gray-500">
                    Spain
                  </p>
                </div>
                <div className="ml-auto flex text-yellow-400">
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                  <span className="material-icons text-lg">star</span>
                </div>
              </div>
              <p className="text-gray-600 italic mb-4 flex-grow">
                "We were tired of walking so we booked the TukTuk tour. Best
                decision ever! We saw so much in 2 hours and Ricardo's driving
                was safe and fun. He knows every corner of this beautiful city."
              </p>
              <div className="pt-4 border-t border-gray-100 mt-auto">
                <span className="text-xs font-semibold text-azulejo bg-azulejo-light px-2 py-1 rounded">
                  Tour: 7 Hills by TukTuk
                </span>
              </div>
            </div>
          </div>
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
            href="#"
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
