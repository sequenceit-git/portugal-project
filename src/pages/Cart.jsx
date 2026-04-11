import { useContext } from "react";
import { Link } from "react-router-dom";
import { CartContext } from "../lib/CartContext";
import Footer from "../components/Footer";
import SEO from "../components/SEO";

const Cart = () => {
  const { cart, removeFromCart, updateCartItem, getCartTotal } =
    useContext(CartContext);

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background-light text-slate-900 font-display antialiased">
        <SEO
          title="Shopping Cart"
          description="Your shopping cart is empty. Browse our tours."
          noIndex={true}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pt-24">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Your Cart
          </h1>
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons text-6xl text-slate-300 mb-4">
              shopping_cart
            </span>
            <p className="text-lg text-slate-500 mb-8">Your cart is empty</p>
            <Link
              to="/tours"
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-orange-600 transition-colors"
            >
              Browse Tours
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-background-light text-slate-900 font-display antialiased">
      <SEO
        title="Shopping Cart"
        description="Review your selected tours before booking."
        noIndex={true}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-12 md:py-16 pt-20 sm:pt-24">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-6 sm:mb-8">
          Your Cart
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
          {/* Cart Items - Full width on mobile, 2/3 on desktop */}
          <div className="lg:col-span-2 space-y-3 sm:space-y-5">
            {cart.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Tour Image */}
                {item.image && (
                  <div className="h-40 sm:h-48 md:h-56 overflow-hidden bg-gray-200">
                    <img
                      src={item.image}
                      alt={item.tourName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Tour Info */}
                <div className="p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5">
                  {/* Title & Category */}
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 flex-1 leading-snug">
                      {item.tourName}
                    </h3>
                    {item.category && (
                      <span className="inline-block bg-primary text-white text-xs sm:text-sm font-bold px-3 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
                        {item.category}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {item.details && (
                    <p className="text-sm sm:text-base text-slate-600 line-clamp-3 leading-relaxed">
                      {item.details}
                    </p>
                  )}

                  {/* Quick Info Grid */}
                  <div className="grid grid-cols-3 gap-3 sm:gap-4 py-4 border-t border-b border-slate-200">
                    {item.duration && (
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 uppercase font-bold mb-1">Duration</p>
                        <p className="text-sm sm:text-base font-bold text-slate-900">{item.duration}h</p>
                      </div>
                    )}
                    {item.guideLanguage && (
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 uppercase font-bold mb-1">Language</p>
                        <p className="text-sm sm:text-base font-bold text-slate-900">{item.guideLanguage}</p>
                      </div>
                    )}
                    {item.rating && (
                      <div>
                        <p className="text-xs sm:text-sm text-slate-500 uppercase font-bold mb-1">Rating</p>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm sm:text-base font-bold text-slate-900">{Number(item.rating).toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discount Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex gap-2 sm:gap-3">
                    <span className="material-icons text-blue-500 text-base sm:text-lg flex-shrink-0 mt-0.5">info</span>
                    <span className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                      <b>Special Offer:</b> Book for <b>2+ people</b> and get <b>group discount</b> at checkout!
                    </span>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-xs sm:text-sm text-slate-500 uppercase font-bold mb-2">
                      Price per Person
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-primary">
                      ${item.price || 0}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Link
                      to={`/tour-details/${item.tourId}`}
                      className="flex-1 bg-primary text-white font-bold py-3 text-sm sm:text-base rounded-lg transition hover:bg-primary-dark flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                    >
                      <span className="material-icons text-lg">event_note</span>
                      <span>Check Details & Proceed with Booking</span>
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 text-sm sm:text-base rounded-lg transition border border-red-200 flex items-center justify-center gap-2"
                    >
                      <span className="material-icons text-lg">delete</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart Summary - Stack on mobile, sidebar on desktop */}
          <div className="lg:col-span-1">
            <div className="bg-surface-light rounded-lg sm:rounded-xl shadow-lg border border-slate-100 p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-5 sm:mb-6">
                Cart Summary
              </h2>

              <div className="space-y-3 mb-5 sm:mb-6 pb-4 sm:pb-6 border-b border-slate-200">
                <div className="flex justify-between text-sm sm:text-base text-slate-600">
                  <span>Items in cart</span>
                  <span className="font-bold text-slate-900">{cart.length}</span>
                </div>
                <div className="text-sm text-slate-600 leading-relaxed">
                  Each item requires booking details to proceed
                </div>
              </div>

              <div className="mb-5 sm:mb-6">
                <p className="text-xs sm:text-sm text-slate-500 uppercase font-bold mb-2">
                  Total Cart Value
                </p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
                  ${total.toFixed(2)}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-5 sm:mb-6 flex gap-2 sm:gap-3">
                <span className="material-icons text-blue-500 text-lg flex-shrink-0 mt-0.5">info</span>
                <span className="text-xs sm:text-sm text-blue-900 leading-relaxed">
                  Click "Proceed with Booking" for any tour to start booking. Manage multiple tours from your cart.
                </span>
              </div>

              <Link
                to="/tours"
                className="block w-full bg-slate-100 text-slate-900 py-3 sm:py-3.5 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base text-center border border-slate-200 hover:bg-slate-200 transition-colors mb-3 sm:mb-4"
              >
                + Add More Tours
              </Link>

              <div className="text-xs sm:text-sm text-slate-600 text-center flex items-center justify-center gap-1.5">
                <span className="material-icons text-sm text-green-500">verified_user</span>
                <span>Free cancellation up to 24h before</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
