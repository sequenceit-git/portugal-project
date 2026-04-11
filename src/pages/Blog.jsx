import { Link } from "react-router-dom";
import { useEffect } from "react";
import Footer from "../components/Footer.jsx";
import { blogPosts } from "../data/blogPosts.js";

const Blog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="flex-grow py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center font-display">Tukinlisbon Blog</h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">
          Discover the top sights, historical landmarks, and hidden gems of Lisbon. Read our travel guides to plan your perfect itinerary.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/blog/${post.slug}`}>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-primary transition-colors">{post.title}</h2>
                  <p className="text-gray-600 text-sm mb-4 leading-relaxed">{post.excerpt}</p>
                  <span className="text-primary font-semibold text-sm">Read more &rarr;</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;