
import React from 'react';
import { Star, Clock, Play } from 'lucide-react';
import { Movie } from '../types';
import { Link } from 'react-router-dom';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  // Use a fallback for images if the generated URL doesn't work well
  const imageUrl = movie.posterUrl.startsWith('http') 
    ? movie.posterUrl 
    : `https://picsum.photos/seed/${movie.id}/400/600`;

  return (
    <Link 
      to={`/movie/${movie.id}`} 
      state={{ movie }}
      className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 hover:border-indigo-500/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[2/3] relative">
        <img 
          src={imageUrl} 
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="bg-indigo-600 p-3 rounded-full text-white transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-6 h-6 fill-current" />
            </div>
        </div>
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-xs font-bold flex items-center gap-1 border border-zinc-700">
          <Star className="w-3 h-3 text-yellow-500 fill-current" />
          {movie.rating.toFixed(1)}
        </div>
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-zinc-100 truncate group-hover:text-indigo-400 transition-colors">
          {movie.title}
        </h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
          <span>{movie.year}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {movie.duration || 'N/A'}
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {movie.genre.slice(0, 2).map((g) => (
            <span key={g} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-400 uppercase tracking-wider">
              {g}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
