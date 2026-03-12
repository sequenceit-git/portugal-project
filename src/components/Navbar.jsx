import { useState } from "react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  // { to: "/tours", label: "Tours" },
  { to: "/gallery", label: "Gallery" },
  { to: "/guest-stories", label: "Guest Stories" },
  // { to: "/contact", label: "Contact" },
  { to: "/feedback", label: "Review" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex-shrink-0 flex items-center h-16 overflow-hidden"
            onClick={() => setIsOpen(false)}
          >
              <img
                src="/assets/logo/lisbonlogo.png"
                alt="Tukinlisbon"
                className="h-20 sm:h-24 md:h-28 lg:h-32 xl:h-36 w-auto object-contain"
              />
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 ml-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `text-base font-medium transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-primary border-b-2 border-primary pb-1"
                      : "text-slate-700 hover:text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/tours"
              className="bg-primary hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-base font-semibold shadow-md hover:shadow-lg transition-all"
            >
              Book a Tour
            </NavLink>
          </div>

          {/* Hamburger Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-primary hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="material-icons text-2xl">
              {isOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden bg-white border-t border-slate-200 overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/tours"
            onClick={() => setIsOpen(false)}
            className="block mt-4 px-4 py-2.5 bg-primary hover:bg-orange-600 text-white rounded-lg text-sm font-semibold text-center shadow-md transition-all"
          >
            Book a Tour
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
