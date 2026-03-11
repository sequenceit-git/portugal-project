import { Link } from "react-router-dom";

const TourCard = ({ tour, onPreviewClick }) => {
  const stars = [];
  const rating = tour.rating || 0;
  const fullStars = Math.floor(rating);
  const halfStar = rating - fullStars >= 0.5;
  for (let i = 0; i < fullStars; i++) stars.push(<span key={i}>★</span>);
  if (halfStar) stars.push(<span key="half">☆</span>);

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform transform hover:-translate-y-1">
      <div className="h-48 w-full bg-gray-100 relative">
        {tour.title_image && tour.title_image.length > 0 ? (
          <img
            src={tour.title_image}
            alt={tour.name}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            width="400"
            height="192"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        {/* hover details overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-4 text-center text-white text-sm">
          {tour.details || "No details available"}
        </div>
      </div>
      <div className="p-4">
        <span className="inline-block bg-primary text-white text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide mb-2">
          {tour.category}
        </span>
        <h3 className="text-xl font-semibold mb-1">{tour.name}</h3>
        <div className="flex items-center text-yellow-400 text-sm mb-1">
          {stars}
          <span className="text-slate-500 ml-2">
            ({tour.review_count || 0})
          </span>
        </div>
        {tour.activity && (
          <p className="text-slate-500 text-sm mb-1">{tour.activity}</p>
        )}
        <p className="mt-2 text-slate-700 text-sm">
          {tour.duration}h &middot; Private Group Tour
        </p>
      </div>
      <div className="flex gap-2 px-4 pb-4">
        {/* <button
          onClick={() => onPreviewClick(tour)}
          className="flex-1 bg-slate-100 text-slate-900 font-semibold py-3 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2 whitespace-nowrap"
        >
          <span className="material-icons text-base">visibility</span>
          Preview
        </button> */}
        <Link
          to={`/tour-details/${tour.id}`}
          className="flex-1 bg-primary text-white font-semibold py-3 rounded-lg shadow-lg shadow-primary/30 hover:bg-orange-600 transition flex items-center justify-center whitespace-nowrap"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default TourCard;
