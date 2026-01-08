
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { dbService } from '../services/db';
import { Loader2, Database, Search } from 'lucide-react';

const PAGE_SIZE = 50;

const Catalog: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const init = async () => {
      const count = await dbService.getTotalCount();
      setTotal(count);
      const firstPage = await dbService.getMoviesPaged(0, PAGE_SIZE);
      setMovies(firstPage);
      setLoading(false);
    };
    init();
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;
    const more = await dbService.getMoviesPaged(nextPage * PAGE_SIZE, PAGE_SIZE);
    if (more.length < PAGE_SIZE) setHasMore(false);
    setMovies(prev => [...prev, ...more]);
    setPage(nextPage);
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) loadMore();
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4">
            <Database className="w-10 h-10 text-indigo-500" />
            Gran Catálogo
          </h1>
          <p className="text-zinc-500 font-medium mt-2">Explora nuestra colección masiva de {total} títulos.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {movies.map((movie, index) => (
          <div key={movie.id + index} ref={index === movies.length - 1 ? lastRef : null}>
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      )}
    </div>
  );
};

export default Catalog;
