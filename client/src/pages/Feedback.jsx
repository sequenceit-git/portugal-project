import { useState } from "react";
import Footer from "../components/Footer";

const Feedback = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tourExperience: "",
    rating: 0,
    recommendation: "",
    feedback: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingClick = (rating) => {
    setFormData((prev) => ({
      ...prev,
      rating: rating,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission
    setTimeout(() => {
      console.log("Feedback submitted:", formData);
      setSubmitStatus("success");
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        tourExperience: "",
        rating: 0,
        recommendation: "",
        feedback: "",
      });
    }, 1500);
  };

  const tourOptions = [
    "Lisbon City Tour",
    "Sintra & Cascais Day Trip",
    "Food & Wine Tasting",
    "Fado Night Experience",
    "Porto Day Trip",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-background-light text-slate-900 font-display antialiased">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
            Share Your Feedback
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your opinion matters! Help us improve our tours and services by
            sharing your experience with us.
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-slate-100">
          {submitStatus === "success" && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-green-600 mr-2">
                  check_circle
                </span>
                <p className="text-green-800 font-semibold">
                  Thank you! Your feedback has been submitted successfully.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Your Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200 outline-none"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Tour Experience */}
            <div>
              <label
                htmlFor="tourExperience"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                Which tour did you experience? *
              </label>
              <select
                id="tourExperience"
                name="tourExperience"
                value={formData.tourExperience}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200 outline-none bg-white"
              >
                <option value="">Select a tour</option>
                {tourOptions.map((tour) => (
                  <option key={tour} value={tour}>
                    {tour}
                  </option>
                ))}
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Overall Rating *
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="focus:outline-none transition-transform duration-150 hover:scale-110"
                  >
                    <span
                      className={`material-icons text-4xl ${
                        star <= (hoveredStar || formData.rating)
                          ? "text-yellow-400"
                          : "text-slate-300"
                      }`}
                    >
                      star
                    </span>
                  </button>
                ))}
                {formData.rating > 0 && (
                  <span className="ml-3 text-slate-600 font-semibold">
                    {formData.rating} / 5
                  </span>
                )}
              </div>
            </div>

            {/* Recommendation */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Would you recommend us to others? *
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  "Definitely",
                  "Probably",
                  "Not Sure",
                  "Probably Not",
                  "No",
                ].map((option) => (
                  <label
                    key={option}
                    className="flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="recommendation"
                      value={option}
                      checked={formData.recommendation === option}
                      onChange={handleChange}
                      required
                      className="w-4 h-4 text-accent-primary focus:ring-accent-primary"
                    />
                    <span className="ml-2 text-slate-700">{option}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                Your Feedback *
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                required
                rows="6"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-all duration-200 outline-none resize-none"
                placeholder="Tell us about your experience... What did you enjoy? What could be improved?"
              ></textarea>
              <p className="mt-2 text-sm text-slate-500">
                Please share your honest thoughts to help us improve
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting || formData.rating === 0}
                className="px-8 py-4 bg-accent-primary text-white font-bold rounded-lg hover:bg-accent-dark transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <span className="material-icons animate-spin mr-2">
                      refresh
                    </span>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <span className="material-icons mr-2">send</span>
                    Submit Feedback
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Why Feedback Matters Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-md border border-slate-100">
            <span className="material-icons text-5xl text-accent-primary mb-4">
              insights
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Improve Our Services
            </h3>
            <p className="text-slate-600">
              Your feedback helps us enhance our tours and deliver better
              experiences
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md border border-slate-100">
            <span className="material-icons text-5xl text-accent-primary mb-4">
              groups
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Help Future Guests
            </h3>
            <p className="text-slate-600">
              Share your insights to help others make informed decisions
            </p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-md border border-slate-100">
            <span className="material-icons text-5xl text-accent-primary mb-4">
              favorite
            </span>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              We Value You
            </h3>
            <p className="text-slate-600">
              Every opinion matters and is carefully reviewed by our team
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;
