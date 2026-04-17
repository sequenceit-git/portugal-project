import { useState } from "react";

const FeaturedStoryCard = ({ story, renderStars }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="group relative bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100">
      <div className="relative h-56 sm:h-64 overflow-hidden">
        {!imageLoaded && (
          <div className="absolute inset-0 w-full h-full bg-gray-200 animate-pulse z-10" />
        )}
        <img
          alt="Guest story"
          className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ${imageLoaded ? "" : "invisible"}`}
          src={story.image}
          loading="lazy"
          decoding="async"
          width="480"
          height="256"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 to-transparent">
          <span className="text-white text-xs font-bold bg-primary px-2 py-1 rounded mb-2 inline-block">
            {story.category}
          </span>
          <h3 className="text-white font-bold text-sm sm:text-base">
            {story.quote}
          </h3>
        </div>
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed mb-3">
          {story.review}
        </p>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-[10px]">
              {story.author
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">{story.author}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">
                {story.location}
              </p>
            </div>
          </div>
          <div className="flex">{renderStars(story.rating)}</div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedStoryCard;
