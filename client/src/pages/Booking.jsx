import React, { useState } from "react";

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState("24");
  const [selectedTime, setSelectedTime] = useState("11:00 AM");
  const [groupSize, setGroupSize] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="bg-background-light text-gray-800 font-display antialiased flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="flex-grow py-8 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Left Column: Booking Flow */}
            <div className="lg:col-span-7 space-y-10">
              {/* Section Header */}
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-2">
                  Complete your booking
                </h1>
                <p className="text-gray-500">
                  You're just a few steps away from exploring Lisbon like a
                  local.
                </p>
              </div>

              {/* Step 1: Date & Time */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    When are you visiting?
                  </h2>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  {/* Calendar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-gray-900">
                        Select a Date
                      </h3>
                      <div className="flex gap-2">
                        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                          <span className="material-icons text-gray-400">
                            chevron_left
                          </span>
                        </button>
                        <span className="font-medium text-sm pt-1">
                          October 2023
                        </span>
                        <button className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                          <span className="material-icons text-gray-900">
                            chevron_right
                          </span>
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                      {[
                        { day: "Mon", date: "23", disabled: false },
                        {
                          day: "Tue",
                          date: "24",
                          disabled: false,
                          selected: true,
                        },
                        { day: "Wed", date: "25", disabled: true },
                        { day: "Thu", date: "26", disabled: false },
                        { day: "Fri", date: "27", disabled: false },
                        { day: "Sat", date: "28", disabled: false },
                        { day: "Sun", date: "29", disabled: false },
                      ].map((item) => (
                        <button
                          key={item.date}
                          onClick={() =>
                            !item.disabled && setSelectedDate(item.date)
                          }
                          disabled={item.disabled}
                          className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all h-full ${
                            item.disabled
                              ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-100"
                              : selectedDate === item.date
                                ? "bg-primary border-primary text-white"
                                : "border-gray-100 bg-gray-50 hover:border-primary/50"
                          }`}
                        >
                          <span
                            className={`text-xs font-medium mb-1 ${
                              item.disabled
                                ? "text-gray-400"
                                : selectedDate === item.date
                                  ? "text-white"
                                  : "text-gray-400"
                            }`}
                          >
                            {item.day}
                          </span>
                          <span
                            className={`text-lg font-bold ${
                              item.disabled
                                ? "text-gray-400 line-through"
                                : selectedDate === item.date
                                  ? "text-white"
                                  : "text-gray-700"
                            }`}
                          >
                            {item.date}
                          </span>
                          {item.selected && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-primary mt-2 font-medium flex items-center gap-1">
                      <span className="material-icons text-sm">
                        local_fire_department
                      </span>
                      Only 2 slots left for this week! High demand.
                    </p>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Select a Time
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {["09:30 AM", "11:00 AM", "02:30 PM", "05:00 PM"].map(
                        (time, idx) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            disabled={idx === 3}
                            className={`px-5 py-2.5 rounded-full border text-sm font-medium transition-all ${
                              idx === 3
                                ? "opacity-50 cursor-not-allowed border-gray-200 text-gray-400 bg-gray-100 line-through"
                                : selectedTime === time
                                  ? "bg-primary text-white border-primary shadow-sm"
                                  : "border-gray-200 text-gray-700 hover:border-primary/50"
                            }`}
                          >
                            {time}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 2: Who is coming? */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm border border-primary/20">
                    2
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Who is coming?
                  </h2>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {[
                      {
                        id: "firstName",
                        label: "First Name",
                        placeholder: "e.g. Sarah",
                      },
                      {
                        id: "lastName",
                        label: "Last Name",
                        placeholder: "e.g. Jenkins",
                      },
                      {
                        id: "email",
                        label: "Email Address",
                        placeholder: "sarah@example.com",
                        type: "email",
                        icon: "email",
                      },
                      {
                        id: "phone",
                        label: "WhatsApp / Phone",
                        placeholder: "+1 (555) 000-0000",
                        type: "tel",
                        icon: "phone",
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2">
                        <label
                          className="text-sm font-medium text-gray-700"
                          htmlFor={field.id}
                        >
                          {field.label}
                        </label>
                        <div className="relative">
                          {field.icon && (
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                              <span className="material-icons text-gray-400 text-sm">
                                {field.icon}
                              </span>
                            </div>
                          )}
                          <input
                            id={field.id}
                            type={field.type || "text"}
                            placeholder={field.placeholder}
                            value={formData[field.id]}
                            onChange={handleInputChange}
                            className={`block w-full rounded-lg border-gray-300 bg-gray-50 shadow-sm focus:border-primary focus:ring-primary text-gray-900 sm:text-sm p-2.5 ${
                              field.icon ? "pl-9" : ""
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Group Size Stepper */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Group Size
                      </h3>
                      <p className="text-sm text-gray-500">
                        Up to 3 people per TukTuk
                      </p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-gray-200">
                      <button
                        onClick={() => setGroupSize(Math.max(1, groupSize - 1))}
                        disabled={groupSize <= 1}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary disabled:opacity-50"
                      >
                        <span className="material-icons text-sm">remove</span>
                      </button>
                      <span className="text-lg font-bold w-4 text-center">
                        {groupSize}
                      </span>
                      <button
                        onClick={() => setGroupSize(Math.min(3, groupSize + 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-md bg-white text-gray-600 shadow-sm hover:text-primary"
                      >
                        <span className="material-icons text-sm">add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Step 3: Payment */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm border border-primary/20">
                    3
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Secure Payment
                  </h2>
                </div>
                <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100">
                  <div className="p-6 pb-0">
                    <div className="space-y-4">
                      {/* Credit Card Option */}
                      <label className="cursor-pointer relative block">
                        <input
                          type="radio"
                          name="payment"
                          value="credit-card"
                          checked={paymentMethod === "credit-card"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`flex items-center justify-between p-4 rounded-lg border-2 hover:border-primary/50 transition-all ${
                            paymentMethod === "credit-card"
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                paymentMethod === "credit-card"
                                  ? "bg-primary border-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {paymentMethod === "credit-card" && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">
                              Credit Card
                            </span>
                          </div>
                          <span className="material-icons text-2xl text-gray-400">
                            credit_card
                          </span>
                        </div>
                      </label>

                      {/* Credit Card Form */}
                      {paymentMethod === "credit-card" && (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="0000 0000 0000 0000"
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-white text-gray-900 pl-10 py-2.5"
                              />
                              <span className="material-icons absolute left-3 top-2.5 text-gray-400">
                                lock
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                Expiry
                              </label>
                              <input
                                type="text"
                                placeholder="MM / YY"
                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-white text-gray-900 py-2.5"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                                CVC
                              </label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="123"
                                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary bg-white text-gray-900 py-2.5"
                                />
                                <span
                                  className="material-icons absolute right-3 top-2.5 text-gray-400 text-sm cursor-help"
                                  title="3 digits on back"
                                >
                                  help_outline
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Apple Pay Option */}
                      <label className="cursor-pointer relative block">
                        <input
                          type="radio"
                          name="payment"
                          value="apple-pay"
                          checked={paymentMethod === "apple-pay"}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div
                          className={`flex items-center justify-between p-4 rounded-lg border-2 hover:border-primary/50 transition-all ${
                            paymentMethod === "apple-pay"
                              ? "border-primary bg-blue-50"
                              : "border-gray-200 bg-white"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                paymentMethod === "apple-pay"
                                  ? "bg-primary border-primary"
                                  : "border-gray-300"
                              }`}
                            >
                              {paymentMethod === "apple-pay" && (
                                <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">
                              Apple Pay
                            </span>
                          </div>
                          <span className="material-icons text-2xl text-gray-900">
                            phone_iphone
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Security Footer */}
                  <div className="mt-6 bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="material-icons text-green-500 text-base">
                        lock
                      </span>
                      Payments are SSL encrypted and secure.
                    </div>
                    <div className="flex gap-2 opacity-60">
                      <div className="h-6 w-10 bg-gray-300 rounded"></div>
                      <div className="h-6 w-10 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Chat CTA */}
              <div className="hidden lg:flex justify-end">
                <a
                  className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                  href="#"
                >
                  <span className="material-icons text-lg">
                    chat_bubble_outline
                  </span>
                  Not ready to book? Chat with us directly.
                </a>
              </div>
            </div>

            {/* Right Column: Sticky Summary */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-24 space-y-6">
                {/* Summary Card */}
                <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100">
                  <div className="relative h-48 w-full">
                    <img
                      alt="Yellow tram in Lisbon sunny street"
                      className="w-full h-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJbGTCf0dgYbtyVrUalNSiyIoeK7ZYo8kd7dcVh-UWCvyVW_MTvoh_7cnVqBfWQiGAmd8PZNkBoXftwZFGAfTPp9DIeL72LQGWY7YNwuiYAa3uo9dN9iQ6LfSZzfa01OTeJ-wAPQJxb2WLlw3o1RUzpUu-JHup2rhZM6IYibM8Hs9OcJqPzlSmJiSQx29o8uyM39pe1c8Z9GB6IbgUdnUnC0tBpHlnjPCKiD18nuadEALllvz4b_4wXHvdKRxMJjye3kQgW9XF_Q"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <div className="flex items-center gap-1 text-xs font-medium bg-primary px-2 py-0.5 rounded mb-2 w-max">
                        <span className="material-icons text-xs">star</span>
                        5.0 (124 reviews)
                      </div>
                      <h3 className="text-xl font-bold">
                        Lisbon Sunset Solo Tour
                      </h3>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-primary text-lg">
                          schedule
                        </span>
                        <span>2.5 Hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-primary text-lg">
                          groups
                        </span>
                        <span>Private Tour</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-primary text-lg">
                          event
                        </span>
                        <span className="font-medium text-gray-900">
                          Oct {selectedDate}, {selectedTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-icons text-primary text-lg">
                          translate
                        </span>
                        <span>English, PT</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-gray-200 my-4"></div>

                    {/* Price Calculation */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {groupSize} Adult{groupSize > 1 ? "s" : ""} x €65.00
                        </span>
                        <span className="font-medium text-gray-900">
                          €{(65 * groupSize).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-medium text-gray-900">€2.50</span>
                      </div>
                      <div className="flex justify-between items-end pt-2">
                        <span className="font-bold text-lg text-gray-900">
                          Total
                        </span>
                        <span className="font-extrabold text-2xl text-primary">
                          €{(65 * groupSize + 2.5).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Primary CTA */}
                    <button className="w-full bg-primary hover:bg-orange-600 text-white font-bold py-4 rounded-lg shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]">
                      Confirm &amp; Pay
                      <span className="material-icons">arrow_forward</span>
                    </button>

                    <p className="text-xs text-center text-gray-500 mt-4">
                      Free cancellation up to 24h before the tour.
                    </p>
                  </div>
                </div>

                {/* Chat CTA Mobile */}
                <div className="lg:hidden flex justify-center pb-8">
                  <a
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
                    href="#"
                  >
                    <span className="material-icons text-lg">
                      chat_bubble_outline
                    </span>
                    Not ready to book? Chat with us directly.
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2023 Tukinlisbon. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <a className="hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Booking;
