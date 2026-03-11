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
    <nav className="fixed top-0 z-50 w-full bg-white/95 backdrop-blur border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 lg:h-24">
          {/* Logo */}
          <NavLink
            to="/"
            className="flex items-center"
            onClick={() => setIsOpen(false)}
          >
            <img
              src="/assets/logo/logo.png"
              alt="Tukinlisbon"
              width="80"
              height="80"
              className="h-12 sm:h-14 md:h-16 lg:h-20 w-auto object-contain"
            />
          </NavLink>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `text-lg font-medium transition-colors ${
                    isActive
                      ? "text-primary"
                      : "text-slate-900 hover:text-primary"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <NavLink
              to="/tours"
              className="bg-primary text-white px-4 py-2 rounded-full text-md font-semibold shadow-lg shadow-primary/20 hover:bg-orange-600 transition-colors"
            >
              Book a Tour
            </NavLink>
          </div>

          {/* Hamburger Button */}
          <button
            className="md:hidden p-1 rounded-lg text-slate-600 hover:text-primary hover:bg-primary/5 transition-colors"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            <span className="material-icons text-3xl">
              {isOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden bg-white overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `block px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm sm:text-base font-medium transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-800 hover:bg-slate-50 hover:text-primary"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <NavLink
            to="/tours"
            onClick={() => setIsOpen(false)}
            className="block mt-2.5 sm:mt-3 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-semibold text-center shadow-lg shadow-primary/20 hover:bg-orange-600 transition-colors"
          >
            Book a Tour
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
