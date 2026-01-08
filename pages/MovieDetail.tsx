
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Movie, LanguageGroup, ServerLink, ViewingProgress } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { dbService } from '../services/db';
import { Star, Clock, Calendar, ArrowLeft, Play, Heart, Monitor, ChevronRight, Settings, Info, Maximize2, SkipForward, SkipBack } from 'lucide-react';

const MovieDetail: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, toggleFavorite, isAuthenticated, updatePlaybackProgress, continueWatching } = useAuth();
  const movie = state?.movie as Movie;
  
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageGroup | null>(null);
  const [selectedServer, setSelectedServer] = useState<ServerLink | null>(null);
  const [progress, setProgress] = useState(0);

  const isFavorite = user?.favorites.includes(movie?.id);

  useEffect(() => {
    if (movie?.links?.length > 0) {
      setSelectedLang(movie.links[0]);
      if (movie.links[0].servers.length > 0) {
        setSelectedServer(movie.links[0].servers[0]);
      }
    }
    
    // Cargar progreso guardado si existe
    const savedProgress = continueWatching.find(p => p.movieId === movie?.id);
    if (savedProgress) {
      setProgress(savedProgress.progressPercentage);
    }
  }, [movie, continueWatching]);

  if (!movie) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-20 text-center">
        <Monitor className="w-16 h-16 text-zinc-800 mb-4" />
        <p className="text-zinc-500">Película no encontrada.</p>
        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold">Ir al inicio</button>
      </div>
    );
  }

  const handlePlay = () => {
    setShowPlayer(true);
    updatePlaybackProgress(movie, progress);
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setProgress(val);
    updatePlaybackProgress(movie, val);
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    toggleFavorite(movie.id);
  };

  return (
    <div className="relative pb-24">
      <div className="absolute top-0 left-0 w-full h-[80vh] z-0">
        <img src={movie.backdropUrl || movie.posterUrl} alt="" className="w-full h-full object-cover opacity-30 blur-md scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/90 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-zinc-400 hover:text-white mb-10 transition-colors group bg-zinc-900/40 backdrop-blur-xl px-5 py-2.5 rounded-full border border-zinc-800 shadow-xl">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver atrás
        </button>

        <div className="flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800 sticky top-28 bg-zinc-900 aspect-[2/3] group">
              <img src={movie.posterUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              {!showPlayer && movie.links?.length > 0 && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <button onClick={handlePlay} className="bg-indigo-600 p-8 rounded-full text-white shadow-[0_0_50px_rgba(99,102,241,0.5)] hover:scale-110 transition-transform">
                      <Play className="w-12 h-12 fill-current ml-1" />
                    </button>
                 </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                {movie.genre.map(g => (
                  <span key={g} className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-widest backdrop-blur-md">{g}</span>
                ))}
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white leading-none tracking-tighter">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-8 text-zinc-400 text-sm font-bold uppercase tracking-widest">
                <div className="flex items-center gap-3 text-yellow-500 bg-yellow-500/10 px-4 py-2 rounded-2xl border border-yellow-500/20 backdrop-blur-md">
                  <Star className="w-5 h-5 fill-current" /> <span className="text-xl font-black">{movie.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2"><Clock className="w-5 h-5" /> {movie.duration}</div>
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5" /> {movie.year}</div>
              </div>
            </div>

            {/* PLAYER SECTION CON CONTROLES DE PROGRESO */}
            {showPlayer && selectedServer ? (
              <div className="bg-zinc-900/80 backdrop-blur-2xl p-8 rounded-[3rem] border border-zinc-800 space-y-8 animate-in zoom-in-95 duration-500 shadow-2xl relative">
                  <div className="flex flex-wrap gap-6 items-center justify-between border-b border-zinc-800/50 pb-8">
                    <div className="flex gap-3">
                      {movie.links.map((lg) => (
                        <button key={lg.language} onClick={() => { setSelectedLang(lg); setSelectedServer(lg.servers[0]); }}
                          className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${selectedLang?.language === lg.language ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>
                          {lg.language}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {selectedLang?.servers.map((s) => (
                        <button key={s.name} onClick={() => setSelectedServer(s)}
                          className={`px-4 py-2 rounded-xl text-[10px] font-black border transition-all ${selectedServer?.name === s.name ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-lg' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="aspect-video bg-black rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl group relative">
                    <iframe src={selectedServer.url} className="w-full h-full" allowFullScreen frameBorder="0"></iframe>
                    
                    {/* OVERLAY DE CONTROLES RAPIDOS */}
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-indigo-600 transition-all">
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* BARRA DE PROGRESO INTERACTIVA */}
                  <div className="space-y-4 px-4">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                      <span className="flex items-center gap-2"><SkipBack className="w-3 h-3" /> Inicio</span>
                      <span className="text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">Has visto el {progress}%</span>
                      <span className="flex items-center gap-2">Final <SkipForward className="w-3 h-3" /></span>
                    </div>
                    <div className="relative group">
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={progress} 
                        onChange={handleProgressChange}
                        className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500 group-hover:h-3 transition-all"
                      />
                      <div 
                        className="absolute top-1/2 -translate-y-1/2 left-0 h-2 bg-indigo-500 rounded-full pointer-events-none shadow-[0_0_15px_rgba(99,102,241,0.8)] group-hover:h-3 transition-all" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    <p className="text-[9px] text-zinc-600 text-center font-bold italic">
                      * Ajusta la barra manualmente para guardar tu progreso exacto en la nube local.
                    </p>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button onClick={() => setShowPlayer(false)} className="px-8 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                      Detener Reproducción
                    </button>
                  </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 pt-4">
                {movie.links?.length > 0 ? (
                  <button onClick={handlePlay} className="px-12 py-6 bg-indigo-600 text-white font-black rounded-3xl hover:bg-indigo-500 transition-all flex items-center gap-4 shadow-2xl shadow-indigo-600/30 hover:scale-105 active:scale-95 group">
                    <Play className="w-8 h-8 fill-current group-hover:scale-110 transition-transform" /> 
                    <div className="text-left">
                      <span className="block text-xl leading-none">REPRODUCIR AHORA</span>
                      <span className="text-[10px] opacity-70 tracking-widest uppercase">HD 1080P • MULTI-SERVER</span>
                    </div>
                  </button>
                ) : (
                  <div className="px-8 py-6 bg-zinc-900/50 border border-zinc-800 text-zinc-500 rounded-3xl text-sm font-medium italic backdrop-blur-md">
                    Este título aún no ha sido sincronizado en nuestros servidores.
                  </div>
                )}
                <button onClick={handleToggleFavorite} className={`px-8 py-6 rounded-3xl transition-all border flex items-center gap-4 font-black shadow-xl hover:scale-105 active:scale-95 ${isFavorite ? 'bg-pink-600/10 border-pink-500/50 text-pink-500' : 'bg-zinc-900/50 border-zinc-800 text-white hover:bg-zinc-800'}`}>
                  <Heart className={`w-8 h-8 ${isFavorite ? 'fill-current' : ''}`} /> 
                  <span className="text-lg uppercase tracking-tighter">{isFavorite ? 'En favoritos' : 'Añadir a lista'}</span>
                </button>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-12 pt-8">
              <div className="space-y-6">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <Info className="w-6 h-6 text-indigo-500" /> Sinopsis
                </h2>
                <p className="text-zinc-400 text-xl leading-relaxed font-medium">{movie.description}</p>
              </div>
              
              <div className="space-y-6">
                <h2 className="text-3xl font-black flex items-center gap-3">
                  <Settings className="w-6 h-6 text-indigo-500" /> Detalles Técnicos
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Director</p>
                    <p className="text-lg font-bold text-white">{movie.director}</p>
                  </div>
                  <div className="p-5 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Año</p>
                    <p className="text-lg font-bold text-white">{movie.year}</p>
                  </div>
                  <div className="col-span-2 p-5 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-2">Reparto Principal</p>
                    <p className="text-sm font-bold text-zinc-300">{movie.cast.join(' • ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
