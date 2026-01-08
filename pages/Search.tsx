
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { movieService } from '../services/gemini';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { Loader2, Search as SearchIcon, Sparkles } from 'lucide-react';

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Movie[]>([]);
  const [reasoning, setReasoning] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      setLoading(true);
      try {
        const data = await movieService.searchMovies(query);
        setResults(data.movies);
        setReasoning(data.aiReasoning);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-indigo-500" />
          Resultados para: <span className="text-zinc-400">"{query}"</span>
        </h1>
        {reasoning && !loading && (
          <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-indigo-400 mt-1 flex-shrink-0" />
            <p className="text-sm text-indigo-200/80 italic leading-relaxed">
              {reasoning}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-zinc-500">Buscando en la base de datos galáctica...</p>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {results.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-lg">No encontramos películas para esa búsqueda. ¡Prueba con algo diferente!</p>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
