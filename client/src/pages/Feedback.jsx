import { useState, useEffect, useRef } from "react";
import Footer from "../components/Footer";
import { supabase } from "../lib/supabaseClient";
import SEO from "../components/SEO";

const BUCKET = "reviews";

const Feedback = () => {
  const [tours, setTours] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    country: "",
    email: "",
    tourExperience: "",
    rating: 0,
    feedback: "",
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [submitError, setSubmitError] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const lastSubmitRef = useRef(0); // throttle: min 10s between submissions

  useEffect(() => {
    supabase
      .from("tours")
      .select("id, name")
      .order("id", { ascending: true })
      .then(({ data }) => setTours(data || []));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setSubmitError("Photo must be under 2 MB.");
      return;
    }
    setSubmitError("");
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.rating === 0) {
      setSubmitError("Please select a star rating.");
      return;
    }

    // Throttle: reject if less than 10 seconds since last submit
    const now = Date.now();
    if (now - lastSubmitRef.current < 10000) {
      setSubmitError("Please wait a moment before submitting again.");
      return;
    }
    lastSubmitRef.current = now;

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitStatus(null);

    try {
      let photo_url = "";
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const fileName = `${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, photoFile, { contentType: photoFile.type });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(fileName);
        photo_url = urlData.publicUrl;
      }

      const { error: dbErr } = await supabase.from("reviews").insert({
        name: formData.name.trim(),
        country: formData.country.trim(),
        tour_name: formData.tourExperience,
        rating: formData.rating,
        review_text: formData.feedback.trim(),
        photo_url,
      });
      if (dbErr) throw dbErr;

      setSubmitStatus("success");
      setFormData({
        name: "",
        country: "",
        email: "",
        tourExperience: "",
        rating: 0,
        feedback: "",
      });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 font-display antialiased">
      <SEO
        title="Leave a Review"
        description="Enjoyed your Tukinlisbon tour? Share your experience and help other travellers discover the best private tours in Lisbon."
        canonical="/feedback"
        noIndex={true}
      />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary font-bold tracking-wider uppercase text-sm">
            Share Your Story
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mt-3 mb-4">
            Share Your Experience
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Your review helps future travelers — and your photo might appear on
            our homepage!
          </p>
        </div>

        {/* Feedback Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-slate-100">
          {submitStatus === "success" && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <span className="material-icons text-green-600">
                check_circle
              </span>
              <p className="text-green-800 font-semibold">
                Thank you! Your review has been submitted and will appear on our
                homepage.
              </p>
            </div>
          )}

          {submitError && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
              <span className="material-icons text-red-500">error</span>
              <p className="text-red-700">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3">
                Your Photo{" "}
                <span className="text-slate-400 font-normal">
                  (optional — shown on homepage)
                </span>
              </label>
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-dashed border-primary/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="material-icons text-primary/40 text-3xl">
                      person
                    </span>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20 transition-colors text-sm"
                  >
                    <span className="material-icons text-sm">upload</span>
                    {photoFile ? "Change Photo" : "Upload Photo"}
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhoto}
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    JPG, PNG, WEBP · Max 2 MB
                  </p>
                </div>
              </div>
            </div>

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
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="Jane Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-bold text-slate-700 mb-2"
                >
                  Country *
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                  placeholder="United Kingdom"
                />
              </div>
            </div>

            {/* Email (optional) */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                Email Address{" "}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none"
                placeholder="jane@example.com"
              />
            </div>

            {/* Tour Experience */}
            <div>
              <label
                htmlFor="tourExperience"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                Which tour did you take? *
              </label>
              <select
                id="tourExperience"
                name="tourExperience"
                value={formData.tourExperience}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none bg-white"
              >
                <option value="">Select your tour</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name}
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
                    onClick={() => setFormData((p) => ({ ...p, rating: star }))}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    className="focus:outline-none transition-transform hover:scale-110"
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

            {/* Review */}
            <div>
              <label
                htmlFor="feedback"
                className="block text-sm font-bold text-slate-700 mb-2"
              >
                Your Review *
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={formData.feedback}
                onChange={handleChange}
                required
                rows="5"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none resize-none"
                placeholder="Tell us about your experience… What did you enjoy most?"
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-4 bg-primary hover:bg-primary-dark text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/25 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="material-icons animate-spin">refresh</span>
                    Submitting…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <span className="material-icons">send</span>
                    Submit Review
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Why section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: "insights",
              title: "Help Us Improve",
              body: "Your feedback helps us make every tour better and more memorable.",
            },
            {
              icon: "groups",
              title: "Help Future Guests",
              body: "Share your experience so others can choose with confidence.",
            },
            {
              icon: "favorite",
              title: "We Value You",
              body: "Every review is read personally by our guide.",
            },
          ].map((c) => (
            <div
              key={c.title}
              className="text-center p-6 bg-white rounded-xl shadow-md border border-slate-100"
            >
              <span className="material-icons text-5xl text-primary mb-4">
                {c.icon}
              </span>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {c.title}
              </h3>
              <p className="text-slate-600">{c.body}</p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Feedback;
