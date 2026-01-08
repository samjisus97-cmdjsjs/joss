
import React, { useEffect, useState } from 'react';
import { movieService } from '../services/gemini';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Loader2, Sparkles, Play, Database, Zap, Clock, ChevronRight, LayoutGrid, Heart, Flame, Star } from 'lucide-react';

const CATEGORIES = [
  { id: 'accion', name: 'Acción', icon: '💥' },
  { id: 'comedia', name: 'Comedia', icon: '😂' },
  { id: 'terror', name: 'Terror', icon: '👻' },
  { id: 'drama', name: 'Drama', icon: '🎭' },
  { id: 'sci-fi', name: 'Sci-Fi', icon: '🚀' },
  { id: 'romance', name: 'Romance', icon: '❤️' },
];

const Home: React.FC = () => {
  const { continueWatching } = useAuth();
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const trending = await movieService.getTrendingMovies();
        setTrendingMovies(trending);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const featured = trendingMovies[0];

  if (loading && trendingMovies.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">CineAI Engine: Warming up...</p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* HERO SECTION - REFINED */}
      {featured && (
        <section className="relative h-[90vh] w-full overflow-hidden">
          <img src={featured.backdropUrl || featured.posterUrl} className="absolute inset-0 w-full h-full object-cover scale-105" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-transparent to-transparent" />
          
          <div className="relative h-full max-w-7xl mx-auto px-6 flex flex-col justify-end pb-32">
            <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-black uppercase tracking-[0.2em] bg-indigo-500/10 backdrop-blur-xl px-5 py-2 rounded-full border border-indigo-500/30">
                  <Sparkles className="w-4 h-4" /> Recomendación IA
                </div>
                <div className="flex items-center gap-2 text-yellow-500 text-xs font-black uppercase tracking-[0.2em] bg-yellow-500/10 backdrop-blur-xl px-5 py-2 rounded-full border border-yellow-500/30">
                  <Star className="w-4 h-4 fill-current" /> {featured.rating.toFixed(1)}
                </div>
              </div>
              <h1 className="text-8xl font-black text-white tracking-tighter leading-[0.9] drop-shadow-2xl">
                {featured.title}
              </h1>
              <div className="flex gap-4 items-center text-zinc-400 text-sm font-bold uppercase tracking-widest">
                <span>{featured.year}</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <span>{featured.duration}</span>
                <span className="w-1 h-1 bg-zinc-700 rounded-full" />
                <span className="text-indigo-400">{featured.genre[0]}</span>
              </div>
              <p className="text-xl text-zinc-300 font-medium max-w-xl leading-relaxed">
                {featured.description}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link to={`/movie/${featured.id}`} state={{ movie: featured }} className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black font-black rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl hover:scale-105 active:scale-95">
                  <Play className="w-6 h-6 fill-current" /> REPRODUCIR
                </Link>
                <button className="inline-flex items-center gap-4 px-8 py-5 bg-zinc-900/50 backdrop-blur-xl text-white font-black rounded-2xl border border-zinc-800 hover:bg-zinc-800 transition-all">
                  <Heart className="w-6 h-6" /> MI LISTA
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-30 space-y-24">
        
        {/* SEGUIR VIENDO - CON BARRA DE PROGRESO */}
        {continueWatching.length > 0 && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-3xl font-black flex items-center gap-4 tracking-tight">
              <Clock className="w-8 h-8 text-indigo-500" /> Seguir viendo
            </h2>
            <div className="flex gap-8 overflow-x-auto pb-6 no-scrollbar snap-x">
              {continueWatching.slice(0, 10).map((item) => (
                <Link key={item.movieId} to={`/movie/${item.movieId}`} className="snap-start shrink-0 w-64 group">
                  <div className="relative aspect-[16/9] rounded-[2rem] overflow-hidden border border-zinc-800 bg-zinc-900 shadow-xl group-hover:border-indigo-500/50 transition-all duration-300">
                    <img src={item.posterUrl} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100" alt="" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-10 h-10 text-white fill-current" />
                    </div>
                    {/* BARRA DE PROGRESO */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-950">
                      <div 
                        className="h-full bg-indigo-500 shadow-[0_0_15px_indigo] transition-all duration-1000" 
                        style={{ width: `${item.progressPercentage}%` }} 
                      />
                    </div>
                    <div className="absolute top-4 right-4 bg-indigo-600 px-3 py-1 rounded-full text-[10px] font-black text-white shadow-lg">
                      {item.progressPercentage}%
                    </div>
                  </div>
                  <h3 className="mt-4 text-base font-black text-zinc-400 truncate group-hover:text-white transition-colors">{item.movieTitle}</h3>
                  <p className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">HACE UN MOMENTO</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* GÉNEROS RÁPIDOS */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
           {CATEGORIES.map(cat => (
             <Link key={cat.id} to={`/category/${cat.id}`} className="group relative p-6 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden hover:border-indigo-500/50 transition-all">
                <span className="relative z-10 text-2xl mb-2 block">{cat.icon}</span>
                <span className="relative z-10 text-sm font-black uppercase tracking-widest text-zinc-400 group-hover:text-white transition-colors">{cat.name}</span>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <LayoutGrid className="w-12 h-12" />
                </div>
             </Link>
           ))}
        </section>

        {/* TENDENCIAS */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-black tracking-tighter flex items-center gap-4">
              <Flame className="w-10 h-10 text-orange-500 fill-current" /> Tendencias Globales
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {trendingMovies.map(m => <MovieCard key={m.id} movie={m} />)}
          </div>
        </section>

        {/* ACCESO AL GRAN CATÁLOGO - REFINADO */}
        <section className="bg-gradient-to-br from-indigo-950 via-zinc-900 to-zinc-900 border border-indigo-500/20 rounded-[4rem] p-16 relative overflow-hidden group">
          <div className="absolute -top-24 -right-24 p-12 opacity-10 group-hover:scale-110 transition-transform duration-1000 group-hover:rotate-12">
             <Database className="w-96 h-96 text-indigo-500" />
          </div>
          <div className="relative z-10 max-w-2xl space-y-8">
            <h2 className="text-6xl font-black text-white tracking-tighter leading-none">Descubre más de 11,000 títulos únicos.</h2>
            <p className="text-xl text-zinc-400 font-medium leading-relaxed">Nuestra biblioteca exclusiva se sincroniza cada 24h para ofrecerte la colección más completa de la red.</p>
            <Link to="/catalog" className="inline-flex items-center gap-4 px-12 py-5 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95">
              EXPLORAR CATÁLOGO COMPLETO <ChevronRight className="w-6 h-6" />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Home;
