const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 sm:pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12 mb-10 sm:mb-12">
          <div>
            <a href="/" className="flex items-center mb-6">
              <picture>
                <source srcSet="/logo.webp" type="image/webp" />
                <img
                  src="/logo-small.png"
                  alt="Tukinlisbon"
                  className="h-10 sm:h-14 w-auto object-contain"
                  width="56"
                  height="56"
                  loading="lazy"
                  decoding="async"
                />
              </picture>
            </a>
            <p className="text-gray-500 text-xs sm:text-sm mb-4 sm:mb-6">
              Personalized tours in Lisbon tailored to create unforgettable
              memories. Experience the city like a local.
            </p>
            <div className="flex gap-4">
              {/* <a
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                href="#"
              >
                <span className="material-icons text-sm">facebook</span>
              </a>
              <a
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-primary hover:text-white transition-colors"
                href="#"
              >
                <span className="material-icons text-sm">camera_alt</span>
              </a> */}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">
              Experiences
            </h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-gray-600">
              <li>
                <a
                  className="hover:text-primary transition-colors"
                  href="/tours"
                >
                  Walking Tours
                </a>
              </li>

              <li>
                <a
                  className="hover:text-primary transition-colors"
                  href="/tours"
                >
                  TukTuk Adventure
                </a>
              </li>
              <li>
                <a
                  className="hover:text-primary transition-colors"
                  href="/tours"
                >
                  Sintra Day Trip
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">
              Company
            </h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-gray-600">
              <li>
                <a className="hover:text-primary transition-colors" href="#">
                  About Us
                </a>
              </li>

              <li>
                <a
                  className="hover:text-primary transition-colors"
                  href="/contact"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 mb-4 sm:mb-6 text-sm sm:text-base">
              Contact
            </h4>
            <ul className="space-y-2.5 sm:space-y-4 text-xs sm:text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="material-icons text-primary text-sm mt-1">
                  email
                </span>
                <span>tukinlisbon2@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-icons text-primary text-sm mt-1">
                  phone
                </span>
                <span>+351 9203 377 914</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-icons text-primary text-sm mt-1">
                  place
                </span>
                <span>Lisbon, Portugal</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-[11px] sm:text-xs text-gray-400 text-center md:text-left">
            © 2026 Tukinlisbon. All rights reserved.
          </p>
          <div className="w-full md:w-auto flex flex-wrap items-center justify-center md:justify-end gap-3 sm:gap-6">
            <span className="text-[11px] sm:text-xs leading-tight text-gray-400 hover:text-gray-600 cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-[11px] sm:text-xs leading-tight text-gray-400 hover:text-gray-600 cursor-pointer">
              Terms of Service
            </span>
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-gray-100 rounded text-[11px] sm:text-xs text-gray-500 font-medium leading-tight">
              <span className="material-icons text-[11px] sm:text-xs text-primary">
                verified_user
              </span>
              Certified by Tourism Portugal
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
