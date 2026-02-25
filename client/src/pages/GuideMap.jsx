const GuideMap = () => {
  return (
    <section className="h-[calc(100vh-6rem)] bg-background-light font-display text-slate-800 overflow-hidden flex flex-col md:flex-row antialiased">
      <aside className="w-full md:w-[400px] lg:w-[450px] flex-shrink-0 flex flex-col h-full bg-white border-r border-slate-200 shadow-xl z-20">
        <div className="p-6 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <span className="material-icons">tram</span>
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-slate-900">
                Tukinlisbon
              </h1>
              <p className="text-xs font-medium text-primary uppercase tracking-wider">
                Premium Solo Guide
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold leading-tight">
              Explore Lisbon with a Local
            </h2>
            <div className="relative group">
              <span className="material-icons absolute left-3 top-3 text-slate-400 group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm placeholder:text-slate-400"
                placeholder="Find cafes, viewpoints..."
                type="text"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button className="px-4 py-1.5 rounded-full bg-primary text-white text-sm font-medium shadow-md shadow-primary/25 whitespace-nowrap">
                All Spots
              </button>
              <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-colors text-sm font-medium whitespace-nowrap">
                Viewpoints
              </button>
              <button className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 hover:border-primary hover:text-primary transition-colors text-sm font-medium whitespace-nowrap">
                Hidden Cafes
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-background-light">
          <div className="bg-white p-3 rounded-xl shadow-sm border border-primary/30 ring-1 ring-primary/10 cursor-pointer transition-all hover:shadow-md flex gap-4">
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
              <img
                className="w-full h-full object-cover"
                data-alt="Lisbon sunset viewpoint with people"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBTup1C0_IlXIMC8N-0Imdf6V5x4ITu3q_nIm5jC2LMzAwEp9fgYq49ZasfXvI2Zx9LYxf6_GgnYU7hCoNOalfokkx9PQJ9EZHOF6y08xhBigdTDvFcv_U8Fb1BsDTY5Mafp49AgqWIjVBlVQTBDS0tDHRGt2hZNp8cObi7j9lSrGZgWV_HuZSr-66YCOacCE-bGzR4IiQUbDeDc9_iguYNIaFHkgQ_6Co5KqbXULgJS39kr7_8fmAb1qNkFRWmAocmWVosc_wWXg"
              />
              <div className="absolute top-1 left-1 bg-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-sm">
                TOP PICK
              </div>
            </div>
            <div className="flex flex-col justify-between py-0.5 flex-1">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-slate-800 leading-tight">
                    Miradouro da Senhora
                  </h3>
                  <span className="material-icons text-primary text-sm">
                    favorite
                  </span>
                </div>
                <p className="text-xs text-primary font-medium mt-1">
                  Viewpoint • Graça
                </p>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                Best sunset in the city. The vibe here is unmatched.
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-transparent hover:border-primary/30 cursor-pointer transition-all hover:shadow-md flex gap-4 group">
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
              <img
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                data-alt="Fresh Pastéis de Nata pastries"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJzAhU9YwBApQPFKxu2irfkXxhDjVRGDN29Dz249kN3LahCt2pIouKulHeFp6i7U6Zf9zV94I6jqUGkoDBBtawiQzC5XpF9ARhrxgQ8_0Im_iXyCA4UL3as5y_3_zPbMUePF1AnDmN2fWIkMgdwOIhi1kXFY7kxeJZywxN8CNEYSK28x9Lw6dhLDX_2-3-zI8d8axvjOj6XLgyfPpNr8RysGIlrGLVUOU8Z2-Kb_njjSFN5LCrv8LPmpqtRbIcU8JpDL8nlJahJg"
              />
            </div>
            <div className="flex flex-col justify-between py-0.5 flex-1">
              <div>
                <h3 className="font-bold text-slate-800 leading-tight">
                  Manteigaria
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Bakery • Chiado
                </p>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                Forget Belém. This is where locals get their Nata.
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-transparent hover:border-primary/30 cursor-pointer transition-all hover:shadow-md flex gap-4 group">
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
              <img
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                data-alt="Yellow tram on steep street"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA67EJyZFAb1ItuMXDUzyUKvXlQsymVltPlCAU7APVPNh_0UUa1U8u1FF3n7TAx0HWf7cqB4dAFryKuJzPtBAcYgs72A6V8c6vEQAHqR2JRL_PfyB47tWxlJE4SN__4CHSFxN-ipHeixOn5xWXYV9UQoP1H1uumZvlEr9DFodqwoVQt7VLCHYdhCCwBD2zIi5-HEwlcHs58rsCjoHQNqwocguk-aGddNZFq0aHRU7vX4y2ckzOt9OX2OwuwLdoMzztpHe4Ouwfc0Q"
              />
            </div>
            <div className="flex flex-col justify-between py-0.5 flex-1">
              <div>
                <h3 className="font-bold text-slate-800 leading-tight">
                  Tram 28 Start Point
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Activity • Martim Moniz
                </p>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                Board early here to grab a seat by the window.
              </p>
            </div>
          </div>

          <div className="bg-white p-3 rounded-xl shadow-sm border border-transparent hover:border-primary/30 cursor-pointer transition-all hover:shadow-md flex gap-4 group">
            <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden relative">
              <img
                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                data-alt="Historic Alfama alleyway"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAccJjiYnbwsNk5984-mZpIcA39sM5mU2KtNGBmnCT9Aeon8M2bWg3dAXFNCG-oKGqXJj4oUi_9ubOXHjTeyic-mYJQSv4jEKiqpRfBFCVJw7Mog2fXjjVMNVSuvQxB3WiCp3b-jYr5lIH3aUSJHqlBG0Iu1SJLrFja-E7Wm9rZnRjSiKx4gVROFgiAnINfRMys7nYJV4YptXzNSRlhAPUEGNBHUY7hOuHqgZJR268bTaMyiQATcRY8bHdFKzD7oTuzkse3fM0ieg"
              />
            </div>
            <div className="flex flex-col justify-between py-0.5 flex-1">
              <div>
                <h3 className="font-bold text-slate-800 leading-tight">
                  Alfama Hidden Stairs
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Photo Spot • Alfama
                </p>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                A secret shortcut that leads to an amazing patio.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 bg-white">
          <button className="w-full py-3.5 bg-primary hover:bg-orange-600 text-white font-bold rounded-xl shadow-lg shadow-primary/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
            <span>Book a Private Tour</span>
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 relative bg-slate-100 overflow-hidden">
        <div className="absolute inset-0 map-pattern opacity-60 z-0"></div>
        <div
          className="absolute bottom-0 right-0 w-full h-1/3 bg-blue-100/50 backdrop-blur-[2px] z-0"
          style={{
            clipPath:
              "polygon(0% 100%, 100% 100%, 100% 20%, 60% 30%, 30% 10%, 0% 40%)",
          }}
        ></div>

        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
          <button className="w-10 h-10 bg-white text-slate-600 rounded-lg shadow-lg flex items-center justify-center hover:text-primary hover:bg-slate-50 transition-colors">
            <span className="material-icons">my_location</span>
          </button>
          <div className="flex flex-col bg-white rounded-lg shadow-lg overflow-hidden">
            <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors border-b border-slate-100">
              <span className="material-icons">add</span>
            </button>
            <button className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:text-primary transition-colors">
              <span className="material-icons">remove</span>
            </button>
          </div>
        </div>

        <div className="absolute inset-0 z-0" data-location="Lisbon">
          <div className="absolute top-[35%] left-[45%] z-20 transform -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <div className="mb-4 w-72 bg-white rounded-xl shadow-2xl border border-primary/20 p-0 overflow-hidden animate-fade-in-up">
              <div className="h-28 relative">
                <img
                  className="w-full h-full object-cover"
                  data-alt="Detailed view of Miradouro da Senhora viewpoint"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYCX7Vs5bV829NPOCsoqe-7pd6vcrY-4H2UrO7NrZBOUfB0pG8N2UcYa9PWVYLbWJ8DzUokQDr3hFDSPROSR1GDk-Hhy7pFUMdPrziFeIcY0U2BrceijUPcWY-9KO9wkK8HHQ3kkeBGLCp3LvLBK52EdLnFTahLhkgYt67jxcs5RV2F7P-DBaTeQqu6YWXtVzlp0ZrLWfaiV5yugSP4SshRKVFRHQfnenOOb1KP9i9BUna6Ne6HrQXbQNKzsZpnRrbpnDAGGaokg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <h3 className="absolute bottom-2 left-3 text-white font-bold text-lg drop-shadow-md">
                  Miradouro da Senhora
                </h3>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                    <span className="material-icons text-[14px]">
                      tips_and_updates
                    </span>
                  </span>
                  <p className="text-sm italic text-slate-600 leading-snug">
                    "Come an hour before sunset. There's a small kiosk that
                    sells cold beer for €2."
                  </p>
                </div>
                <a
                  className="inline-flex items-center text-primary text-xs font-bold uppercase tracking-wider hover:underline"
                  href="#"
                >
                  Get Directions
                  <span className="material-icons text-xs ml-1">
                    north_east
                  </span>
                </a>
              </div>
            </div>

            <div className="relative w-12 h-12 flex items-center justify-center cursor-pointer">
              <div className="w-12 h-12 bg-primary/30 rounded-full animate-ping absolute"></div>
              <div className="w-10 h-10 bg-primary rounded-full shadow-lg border-2 border-white flex items-center justify-center z-10 relative">
                <span className="material-icons text-white text-lg">
                  videocam
                </span>
              </div>
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-primary absolute -bottom-2"></div>
            </div>
          </div>

          <div className="absolute top-[60%] left-[30%] marker-hover cursor-pointer group">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none mb-2">
                Manteigaria (Best Nata)
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
              <div className="w-10 h-10 bg-white rounded-full shadow-md border-2 border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-icons text-lg">bakery_dining</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary absolute -bottom-1.5"></div>
            </div>
          </div>

          <div className="absolute top-[45%] left-[55%] marker-hover cursor-pointer group">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none mb-2">
                Tram 28 Start Point
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
              <div className="w-10 h-10 bg-white rounded-full shadow-md border-2 border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-icons text-lg">tram</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary absolute -bottom-1.5"></div>
            </div>
          </div>

          <div className="absolute top-[52%] left-[62%] marker-hover cursor-pointer group">
            <div className="relative flex flex-col items-center">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl pointer-events-none mb-2">
                Alfama Hidden Stairs
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45"></div>
              </div>
              <div className="w-10 h-10 bg-white rounded-full shadow-md border-2 border-primary flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                <span className="material-icons text-lg">camera_alt</span>
              </div>
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary absolute -bottom-1.5"></div>
            </div>
          </div>

          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 300 0 Q 400 300 200 600"
              fill="none"
              stroke="#f46a25"
              strokeWidth="8"
            ></path>
            <path
              d="M 0 400 Q 300 400 800 200"
              fill="none"
              stroke="#94a3b8"
              strokeWidth="12"
            ></path>
            <path
              d="M 600 800 L 600 400 L 800 300"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="10"
            ></path>
            <path
              d="M 200 200 L 400 400 L 300 800"
              fill="none"
              stroke="#cbd5e1"
              strokeWidth="6"
            ></path>
          </svg>
        </div>

        <div className="absolute bottom-6 left-6 z-10 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg border border-white/20">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Map Legend
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="text-xs font-medium text-slate-700">
                Guide's Favorite
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-primary box-border"></div>
              <span className="text-xs font-medium text-slate-700">
                Tour Start Point
              </span>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
};

export default GuideMap;
