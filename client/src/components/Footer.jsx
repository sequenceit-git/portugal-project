 const Footer = () => {
  return (
 

 <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-icons text-primary text-2xl">
                  explore
                </span>
                <span className="font-bold text-xl text-gray-900">
                  Tukin<span className="text-primary">lisbon</span>
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Personalized tours in Lisbon tailored to create unforgettable
                memories. Experience the city like a local.
              </p>
              <div className="flex gap-4">
                <a
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
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">
                Experiences
              </h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Walking Tours
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Food &amp; Wine Tasting
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    TukTuk Adventure
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Sintra Day Trip
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">
                Company
              </h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    About Ricardo
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Blog
                  </a>
                </li>
                <li>
                  <a className="hover:text-primary transition-colors" href="#">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6">
                Contact
              </h4>
              <ul className="space-y-4 text-sm text-gray-600">
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    email
                  </span>
                  <span>ola@tukinlisbon.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-icons text-primary text-sm mt-1">
                    phone
                  </span>
                  <span>+351 912 345 678</span>
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

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">
              © 2023 Tukinlisbon. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                Privacy Policy
              </span>
              <span className="text-xs text-gray-400 hover:text-gray-600 cursor-pointer">
                Terms of Service
              </span>
              <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded text-xs text-gray-500 font-medium">
                <span className="material-icons text-xs text-primary">
                  verified_user
                </span>
                Certified by Tourism Portugal
              </div>
            </div>
          </div>
        </div>
      </footer>

  );
}

export default Footer;