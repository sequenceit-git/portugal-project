import { useState } from "react";
import { Link } from "react-router-dom";

// Lisbon guide spots with real coordinates
const SPOTS = [
  {
    id: 1,
    name: "Miradouro da Graça",
    category: "Viewpoint",
    neighborhood: "Graça",
    description: "Best sunset in the city. The vibe here is unmatched.",
    tip: "Come an hour before sunset. There's a small kiosk that sells cold beer for €2.",
    icon: "visibility",
    badge: "TOP PICK",
    lng: -9.1305,
    lat: 38.7167,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTup1C0_IlXIMC8N-0Imdf6V5x4ITu3q_nIm5jC2LMzAwEp9fgYq49ZasfXvI2Zx9LYxf6_GgnYU7hCoNOalfokkx9PQJ9EZHOF6y08xhBigdTDvFcv_U8Fb1BsDTY5Mafp49AgqWIjVBlVQTBDS0tDHRGt2hZNp8cObi7j9lSrGZgWV_HuZSr-66YCOacCE-bGzR4IiQUbDeDc9_iguYNIaFHkgQ_6Co5KqbXULgJS39kr7_8fmAb1qNkFRWmAocmWVosc_wWXg",
    mapsUrl: "https://maps.app.goo.gl/zLty5GXPme8Lk5Gn7?g_st=awb",
  },
  {
    id: 2,
    name: "Manteigaria",
    category: "Bakery",
    neighborhood: "Chiado",
    description: "Forget Belém. This is where locals get their Nata.",
    tip: "Arrive just before they pull a fresh tray from the oven — ask staff when the next batch is ready.",
    icon: "bakery_dining",
    badge: null,
    lng: -9.1426,
    lat: 38.7108,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJzAhU9YwBApQPFKxu2irfkXxhDjVRGDN29Dz249kN3LahCt2pIouKulHeFp6i7U6Zf9zV94I6jqUGkoDBBtawiQzC5XpF9ARhrxgQ8_0Im_iXyCA4UL3as5y_3_zPbMUePF1AnDmN2fWIkMgdwOIhi1kXFY7kxeJZywxN8CNEYSK28x9Lw6dhLDX_2-3-zI8d8axvjOj6XLgyfPpNr8RysGIlrGLVUOU8Z2-Kb_njjSFN5LCrv8LPmpqtRbIcU8JpDL8nlJahJg",
    mapsUrl: null,
  },
  {
    id: 3,
    name: "Tram 28 — Start Point",
    category: "Activity",
    neighborhood: "Martim Moniz",
    description: "Board early here to grab a seat by the window.",
    tip: "The tram fills fast from Martim Moniz. Get there 10 mins before your planned departure.",
    icon: "tram",
    badge: null,
    lng: -9.1367,
    lat: 38.7165,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA67EJyZFAb1ItuMXDUzyUKvXlQsymVltPlCAU7APVPNh_0UUa1U8u1FF3n7TAx0HWf7cqB4dAFryKuJzPtBAcYgs72A6V8c6vEQAHqR2JRL_PfyB47tWxlJE4SN__4CHSFxN-ipHeixOn5xWXYV9UQoP1H1uumZvlEr9DFodqwoVQt7VLCHYdhCCwBD2zIi5-HEwlcHs58rsCjoHQNqwocguk-aGddNZFq0aHRU7vX4y2ckzOt9OX2OwuwLdoMzztpHe4Ouwfc0Q",
    mapsUrl: null,
  },
  {
    id: 4,
    name: "Alfama Hidden Stairs",
    category: "Photo Spot",
    neighborhood: "Alfama",
    description: "A secret shortcut that leads to an amazing patio.",
    tip: "Turn left at the blue azulejo panel — most tourists walk straight past it.",
    icon: "camera_alt",
    badge: null,
    lng: -9.1327,
    lat: 38.7135,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAccJjiYnbwsNk5984-mZpIcA39sM5mU2KtNGBmnCT9Aeon8M2bWg3dAXFNCG-oKGqXJj4oUi_9ubOXHjTeyic-mYJQSv4jEKiqpRfBFCVJw7Mog2fXjjVMNVSuvQxB3WiCp3b-jYr5lIH3aUSJHqlBG0Iu1SJLrFja-E7Wm9rZnRjSiKx4gVROFgiAnINfRMys7nYJV4YptXzNSRlhAPUEGNBHUY7hOuHqgZJR268bTaMyiQATcRY8bHdFKzD7oTuzkse3fM0ieg",
    mapsUrl: null,
  },
  {
    id: 5,
    name: "Castelo de São Jorge",
    category: "Landmark",
    neighborhood: "Castelo",
    description: "Iconic hilltop castle with panoramic views over all of Lisbon.",
    tip: "Skip the audio guide — walk the ramparts yourself at dusk for the best light.",
    icon: "castle",
    badge: null,
    lng: -9.1336,
    lat: 38.7139,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBYCX7Vs5bV829NPOCsoqe-7pd6vcrY-4H2UrO7NrZBOUfB0pG8N2UcYa9PWVYLbWJ8DzUokQDr3hFDSPROSR1GDk-Hhy7pFUMdPrziFeIcY0U2BrceijUPcWY-9KO9wkK8HHQ3kkeBGLCp3LvLBK52EdLnFTahLhkgYt67jxcs5RV2F7P-DBaTeQqu6YWXtVzlp0ZrLWfaiV5yugSP4SshRKVFRHQfnenOOb1KP9i9BUna6Ne6HrQXbQNKzsZpnRrbpnDAGGaokg",
    mapsUrl: null,
  },
];

const CATEGORIES = ["All Spots", "Viewpoint", "Bakery", "Activity", "Photo Spot", "Landmark"];

const GuideMap = () => {
  const [activeCategory, setActiveCategory] = useState("All Spots");
  const [search, setSearch] = useState("");
  const [activeSpot, setActiveSpot] = useState(null);

  const filtered = SPOTS.filter((s) => {
    const matchCat = activeCategory === "All Spots" || s.category === activeCategory;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.neighborhood.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const getGoogleMapsUrl = (spot) =>
    spot.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${spot.lat},${spot.lng}`;

  return (
    <section className="min-h-[calc(100vh-6rem)] bg-background-light font-display text-slate-800 flex flex-col md:flex-row antialiased">
      {/* ── Sidebar ──────────────────────────────── */}
      <aside className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col md:h-[calc(100vh-6rem)] bg-white border-r border-slate-200 shadow-xl z-20">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img
                src="/logo-small.png"
                alt="Tukinlisbon"
                className="h-12 w-auto object-contain"
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
            </picture>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold leading-tight">Explore Lisbon with a Local</h2>
            <div className="relative group">
              <span className="material-icons absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-slate-400"
                placeholder="Find cafes, viewpoints..."
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-primary text-white shadow-md shadow-primary/25"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Spot list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-background-light">
          {filtered.length === 0 && (
            <p className="text-sm text-slate-400 text-center pt-8">No spots match your search.</p>
          )}
          {filtered.map((spot) => (
            <button
              key={spot.id}
              onClick={() => setActiveSpot(activeSpot?.id === spot.id ? null : spot)}
              className={`w-full text-left bg-white p-3 rounded-xl shadow-sm border cursor-pointer transition-all hover:shadow-md flex gap-4 group ${
                activeSpot?.id === spot.id
                  ? "border-primary/30 ring-1 ring-primary/10"
                  : "border-transparent hover:border-primary/30"
              }`}
            >
              <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
                <img
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  src={spot.image}
                  alt={spot.name}
                  loading="lazy"
                  decoding="async"
                  width="96"
                  height="96"
                />
                {spot.badge && (
                  <div className="absolute top-1 left-1 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                    {spot.badge}
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-between py-0.5 flex-1">
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-800 leading-tight">{spot.name}</h3>
                    {activeSpot?.id === spot.id && (
                      <span className="material-icons text-primary text-sm">favorite</span>
                    )}
                  </div>
                  <p className="text-xs text-primary font-medium mt-1">
                    {spot.category} • {spot.neighborhood}
                  </p>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{spot.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <Link
            to="/tours"
            className="w-full py-3.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Book a Private Tour</span>
            <span className="material-icons text-sm">arrow_forward</span>
          </Link>
        </div>
      </aside>

      {/* ── Main Content — Google Maps embed + spot detail ── */}
      <main className="flex-1 relative flex flex-col">
        {/* Google Maps Embed */}
        <div className="flex-1 relative min-h-[400px]">
          <iframe
            title="Lisbon Guide Map"
            src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${
              activeSpot ? `${activeSpot.lat},${activeSpot.lng}` : "Lisbon,Portugal"
            }&zoom=${activeSpot ? 16 : 14}&maptype=roadmap`}
            className="w-full h-full absolute inset-0 border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        {/* Active spot detail overlay */}
        {activeSpot && (
          <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-80 z-10 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="h-32 relative">
              <img
                src={activeSpot.image}
                alt={activeSpot.name}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                width="320"
                height="128"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <h3 className="absolute bottom-3 left-4 text-white font-bold text-lg drop-shadow-md">
                {activeSpot.name}
              </h3>
              <button
                onClick={() => setActiveSpot(null)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center transition"
              >
                <span className="material-icons text-sm">close</span>
              </button>
            </div>
            <div className="p-4">
              <p className="text-xs text-primary font-semibold mb-2">
                {activeSpot.category} · {activeSpot.neighborhood}
              </p>
              <p className="text-sm text-slate-600 mb-3">{activeSpot.description}</p>
              <div className="flex gap-2 mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <span className="material-icons text-amber-500 text-sm mt-0.5">tips_and_updates</span>
                <p className="text-xs italic text-amber-800 leading-snug">{activeSpot.tip}</p>
              </div>
              <a
                href={getGoogleMapsUrl(activeSpot)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-primary text-sm font-bold hover:underline"
              >
                <span className="material-icons text-sm">directions</span>
                Open in Google Maps
                <span className="material-icons text-xs">open_in_new</span>
              </a>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default GuideMap;
