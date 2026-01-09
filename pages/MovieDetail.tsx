
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Movie, LanguageGroup, ServerLink } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Star, Clock, Calendar, ArrowLeft, Play, Heart, Info, Shield, Zap, History, Server, Globe } from 'lucide-react';

const MovieDetail: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, toggleFavorite, isAuthenticated, updatePlaybackProgress, continueWatching } = useAuth();
  
  const movie = state?.movie as Movie;
  
  const [showPlayer, setShowPlayer] = useState(false);
  const [isActivated, setIsActivated] = useState(false);
  const [selectedLang, setSelectedLang] = useState<LanguageGroup | null>(null);
  const [selectedServer, setSelectedServer] = useState<ServerLink | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (movie?.links?.length > 0) {
      setSelectedLang(movie.links[0]);
      if (movie.links[0].servers.length > 0) {
        setSelectedServer(movie.links[0].servers[0]);
      }
    }
    
    const savedProgress = continueWatching.find(p => p.movieId === movie?.id);
    if (savedProgress) {
      setProgress(savedProgress.progressPercentage);
    }
  }, [movie, continueWatching]);

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-zinc-950">
        <h2 className="text-2xl font-bold text-white mb-4">Película no encontrada</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl">Volver al catálogo</button>
      </div>
    );
  }

  const handlePlay = () => {
    setShowPlayer(true);
    setIsActivated(false);
    // @ts-ignore
    window.isPlayerActive = true;
  };

  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setProgress(val);
    updatePlaybackProgress(movie, val);
  };

  return (
    <div className="min-h-screen bg-[#09090b] relative pb-20">
      {/* Background Hero */}
      <div className="absolute top-0 left-0 w-full h-[70vh] z-0">
        <img src={movie.backdropUrl || movie.posterUrl} alt="" className="w-full h-full object-cover opacity-20 blur-xl scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/80 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-10">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-10 transition-colors group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Volver
        </button>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Poster Column */}
          <div className="lg:w-1/3 flex-shrink-0">
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-800 bg-zinc-900 aspect-[2/3]">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
            </div>
          </div>

          {/* Info Column */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {movie.genre.map(g => (
                  <span key={g} className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-500/20">{g}</span>
                ))}
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white tracking-tighter">{movie.title}</h1>
              <div className="flex items-center gap-6 text-zinc-400 font-bold text-sm uppercase">
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-current" /> {movie.rating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1"><Clock className="w-4 h-4" /> {movie.duration}</div>
                <div className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {movie.year}</div>
              </div>
            </div>

            {showPlayer && selectedServer ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                {/* Selector de Servidor */}
                <div className="flex flex-wrap gap-4 p-4 glass rounded-[2rem]">
                  <div className="flex gap-2 border-r border-zinc-800 pr-4">
                    {movie.links.map(lang => (
                      <button 
                        key={lang.language}
                        onClick={() => { setSelectedLang(lang); setSelectedServer(lang.servers[0]); setIsActivated(false); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedLang?.language === lang.language ? 'bg-indigo-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}
                      >
                        <Globe className="w-3 h-3 inline mr-1" /> {lang.language}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {selectedLang?.servers.map(server => (
                      <button 
                        key={server.name}
                        onClick={() => { setSelectedServer(server); setIsActivated(false); }}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${selectedServer?.name === server.name ? 'border-indigo-500 text-indigo-400' : 'border-zinc-800 text-zinc-500'} border`}
                      >
                        <Server className="w-3 h-3 inline mr-1" /> {server.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reproductor con Intercepción */}
                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border border-zinc-800 group shadow-2xl">
                  <iframe 
                    src={selectedServer.url}
                    className={`w-full h-full ${!isActivated ? 'opacity-50 pointer-events-none' : ''}`}
                    allowFullScreen
                    frameBorder="0"
                  ></iframe>

                  {!isActivated && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-20">
                      <div className="text-center space-y-6 p-8 glass rounded-[3rem] border-white/10 max-w-sm">
                        <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto text-indigo-500">
                          <Shield className="w-8 h-8" />
                        </div>
                        <h4 className="text-lg font-black text-white">Navegación Protegida</h4>
                        <p className="text-xs text-zinc-500 font-medium">Hemos bloqueado anuncios automáticos. Haz clic para activar los controles del video.</p>
                        <button 
                          onClick={() => setIsActivated(true)}
                          className="w-full py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                        >
                          <Zap className="w-4 h-4 fill-current" /> ACTIVAR VIDEO
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full text-[10px] font-black text-indigo-400 border border-indigo-500/20">
                    <Shield className="w-3.5 h-3.5" /> ESCUDO DE CLIC ACTIVO
                  </div>
                </div>

                {/* Controles de Progreso */}
                <div className="space-y-4 px-4">
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    <span>Inicio</span>
                    <span className="text-indigo-400">Progreso guardado: {progress}%</span>
                    <span>Final</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" value={progress}
                    onChange={handleProgress}
                    className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-4 pt-4">
                <button 
                  onClick={handlePlay}
                  className="px-10 py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all flex items-center gap-3 shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95"
                >
                  <Play className="w-6 h-6 fill-current" /> {progress > 0 ? `REANUDAR (${progress}%)` : 'REPRODUCIR AHORA'}
                </button>
                <button 
                  onClick={() => toggleFavorite(movie.id)}
                  className={`px-8 py-5 rounded-2xl font-black border transition-all flex items-center gap-3 ${user?.favorites.includes(movie.id) ? 'bg-pink-500/10 border-pink-500/30 text-pink-500' : 'bg-zinc-900 border-zinc-800 text-white hover:bg-zinc-800'}`}
                >
                  <Heart className={`w-6 h-6 ${user?.favorites.includes(movie.id) ? 'fill-current' : ''}`} /> MI LISTA
                </button>
              </div>
            )}

            <div className="pt-8 grid md:grid-cols-2 gap-12 border-t border-zinc-800/50">
              <div className="space-y-4">
                <h3 className="text-2xl font-black flex items-center gap-2 text-white"><Info className="w-6 h-6 text-indigo-500" /> Sinopsis</h3>
                <p className="text-zinc-400 leading-relaxed text-lg font-medium">{movie.description}</p>
              </div>
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white">Ficha Técnica</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 glass rounded-2xl">
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Director</p>
                    <p className="font-bold text-white truncate">{movie.director}</p>
                  </div>
                  <div className="p-4 glass rounded-2xl">
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Año</p>
                    <p className="font-bold text-white">{movie.year}</p>
                  </div>
                  <div className="col-span-2 p-4 glass rounded-2xl">
                    <p className="text-[10px] font-black text-zinc-600 uppercase mb-1">Reparto</p>
                    <p className="font-bold text-zinc-300 text-sm">{movie.cast.join(', ')}</p>
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