import { useState } from "react";
import Footer from "../components/Footer";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted:", formData);
      setSubmitStatus("success");
      setIsSubmitting(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
    }, 1500);
  };

  const socialLinks = [
    {
      name: "Facebook",
      icon: "facebook",
      url: "https://facebook.com",
      color: "hover:text-blue-600",
    },
    {
      name: "Instagram",
      icon: "photo_camera",
      url: "https://instagram.com",
      color: "hover:text-pink-600",
    },
    {
      name: "Twitter",
      icon: "tag",
      url: "https://twitter.com",
      color: "hover:text-blue-400",
    },
    {
      name: "WhatsApp",
      icon: "chat",
      url: "https://wa.me/",
      color: "hover:text-green-600",
    },
    {
      name: "Email",
      icon: "email",
      url: "mailto:info@tukinlisbon.com",
      color: "hover:text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background-light text-slate-900 font-display antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pt-32">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Have questions about our tours? We'd love to hear from you. Send us
            a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Your Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-bold text-slate-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-bold text-slate-700 mb-2"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors"
                    placeholder="Tour inquiry or booking question"
                  />
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-bold text-slate-700 mb-2"
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors resize-none"
                    placeholder="Tell us about your travel plans or questions..."
                  ></textarea>
                </div>

                {submitStatus === "success" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <span className="material-icons text-green-600">
                      check_circle
                    </span>
                    <p className="text-green-800 text-sm font-medium">
                      Message sent successfully! We'll get back to you soon.
                    </p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary/30 hover:bg-orange-600 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-icons animate-spin">
                        refresh
                      </span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <span className="material-icons">send</span>
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Contact Info & Social */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="material-icons text-primary">place</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Address</h4>
                    <p className="text-sm text-slate-600">
                      Alfama District, Lisbon
                      <br />
                      Portugal
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="material-icons text-primary">phone</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Phone</h4>
                    <p className="text-sm text-slate-600">+351 9203 377 914</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="material-icons text-primary">email</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Email</h4>
                    <p className="text-sm text-slate-600">
                      tukinlisbon2@gmail.com
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <span className="material-icons text-primary">
                      schedule
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">
                      Working Hours
                    </h4>
                    <p className="text-sm text-slate-600">
                      Mon - Sun: 8:15 AM - 4:55 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6">
                Follow Us
              </h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 ${social.color} transition-all hover:scale-110 hover:shadow-md`}
                    aria-label={social.name}
                  >
                    <span className="material-icons text-xl">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
              <p className="text-sm text-slate-500 mt-6">
                Stay connected with us on social media for updates, travel tips,
                and exclusive offers.
              </p>
            </div>

            {/* Quick Response */}
            <div className="bg-gradient-to-br from-primary/10 to-orange-50 rounded-2xl p-6 border border-primary/20">
              <div className="flex items-start gap-3">
                <span className="material-icons text-primary text-3xl">
                  info
                </span>
                <div>
                  <h4 className="font-bold text-slate-900 mb-2">
                    Quick Response
                  </h4>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    We typically respond within 24 hours. For urgent inquiries,
                    please contact us via WhatsApp or phone.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
