import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/tours", label: "Tours" },
  { to: "/gallery", label: "Gallery" },
  { to: "/tour-details", label: "Tour Details" },
  // { to: "/meet-your-guide", label: "Meet Your Guide" },
  { to: "/guest-stories", label: "Guest Stories" },
  {to : "/contact", label: "Contact" },
  { to: "/feedback", label: "Feedback" },
  // { to: "/booking", label: "Booking" },
  // { to: "/map", label: "Map" },
];

const Navbar = () => {
  return (
    <nav className="fixed top-0 z-50 w-full bg-white/90 backdrop-blur border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <a href="../pages/Home.jsx" className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <span className="material-icons text-primary text-3xl">
              explore
            </span>
            <span className="text-xl font-bold tracking-tight">
              Tukinlisbon
            </span>
          </div>
          </a>
          <div className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
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
              className="bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-primary/20 hover:bg-orange-600 transition-colors"
            >
              Book a Tour
            </NavLink>
          </div>
          <div className="md:hidden">
            <span className="material-icons text-3xl text-slate-600">menu</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
