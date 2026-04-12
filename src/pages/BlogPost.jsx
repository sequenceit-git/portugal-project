import { useParams, Navigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { blogPosts } from "../data/blogPosts.js";
import Footer from "../components/Footer.jsx";

const BlogPost = () => {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <div className="relative w-full py-16 md:py-24 bg-primary text-white">
        <div className="flex items-center justify-center">
          <div className="text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold font-display mb-4">
              {post.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Link to="/blog" className="inline-flex items-center text-primary mb-8 hover:underline">
          &larr; Back to all posts
        </Link>
        
        <div 
          className="prose prose-lg prose-orange max-w-none text-gray-700
          prose-h2:text-3xl prose-h2:font-bold prose-h2:text-gray-900 prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-2xl prose-h3:font-semibold prose-h3:text-gray-800 prose-h3:mt-8 prose-h3:mb-4
          prose-p:leading-relaxed prose-p:mb-6"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Call to Action */}
        <div className="mt-16 bg-orange-50 rounded-2xl p-8 text-center border border-orange-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to explore Lisbon?</h3>
          <p className="text-gray-600 mb-6">Book an unforgettable tuk-tuk tour with us and experience these amazing sights first-hand.</p>
          <Link to="/tours" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/30">
            View Our Tours
          </Link>
        </div>
      </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default BlogPost;