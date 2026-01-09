
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Movie, LanguageGroup, ServerLink } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Star, Clock, Calendar, ArrowLeft, Play, Heart, Info, Shield, Zap, History, Server, Globe, Monitor, Share2 } from 'lucide-react';

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
    
    // Desactivamos protección al desmontar
    return () => {
       // @ts-ignore
       if (window.setPlayerProtection) window.setPlayerProtection(false);
    };
  }, [movie, continueWatching]);

  if (!movie) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-10 text-center bg-zinc-950">
        <h2 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter">Título no disponible</h2>
        <button onClick={() => navigate('/')} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black uppercase tracking-widest">Ir al Catálogo</button>
      </div>
    );
  }

  const handlePlay = () => {
    setShowPlayer(true);
    setIsActivated(false);
    // @ts-ignore
    if (window.setPlayerProtection) window.setPlayerProtection(true);
  };

  const handleProgress = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setProgress(val);
    updatePlaybackProgress(movie, val);
  };

  return (
    <div className="min-h-screen bg-[#09090b] relative pb-20">
      {/* BACKGROUND HERO WEB */}
      <div className="absolute top-0 left-0 w-full h-[85vh] z-0 overflow-hidden">
        <img src={movie.backdropUrl || movie.posterUrl} alt="" className="w-full h-full object-cover opacity-10 blur-3xl scale-125" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/60 to-transparent" />
      </div>

      <div className="relative z-10 max-w-screen-2xl mx-auto px-6 lg:px-12 pt-12">
        <button onClick={() => navigate(-1)} className="flex items-center gap-3 text-zinc-500 hover:text-white mb-12 transition-all group font-bold">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> VOLVER ATRÁS
        </button>

        <div className="flex flex-col xl:flex-row gap-16">
          {/* POSTER WEB */}
          <div className="xl:w-[400px] flex-shrink-0">
            <div className="rounded-[3rem] overflow-hidden shadow-[0_40px_80px_-15px_rgba(0,0,0,0.8)] border border-white/5 bg-zinc-900 aspect-[2/3] sticky top-32">
              <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 p-6 web-glass rounded-[2rem] border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Calidad</p>
                    <p className="text-white font-black">4K ULTRA HD</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">IMDb</p>
                    <p className="text-yellow-500 font-black">{movie.rating.toFixed(1)}/10</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* INFO & PLAYER WEB */}
          <div className="flex-1 space-y-12">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-3">
                {movie.genre.map(g => (
                  <span key={g} className="px-5 py-2 bg-white/5 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/5">{g}</span>
                ))}
              </div>
              <h1 className="text-6xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-10 text-zinc-500 font-bold text-sm uppercase tracking-widest">
                <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-indigo-500" /> {movie.duration}</div>
                <div className="flex items-center gap-2"><Calendar className="w-5 h-5 text-indigo-500" /> {movie.year}</div>
                <div className="flex items-center gap-2"><Monitor className="w-5 h-5 text-indigo-500" /> MULTI-SERVER</div>
              </div>
            </div>

            {showPlayer && selectedServer ? (
              <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
                {/* SELECTOR DE SERVIDOR WEB */}
                <div className="flex flex-col md:flex-row gap-6 p-6 web-glass rounded-[2.5rem] border-white/10">
                  <div className="flex gap-3 border-zinc-800 pr-6 border-r-0 md:border-r">
                    {movie.links.map(lang => (
                      <button 
                        key={lang.language}
                        onClick={() => { setSelectedLang(lang); setSelectedServer(lang.servers[0]); setIsActivated(false); }}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${selectedLang?.language === lang.language ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-zinc-800/50 text-zinc-500 hover:text-white'}`}
                      >
                        <Globe className="w-3.5 h-3.5 inline mr-2" /> {lang.language}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {selectedLang?.servers.map(server => (
                      <button 
                        key={server.name}
                        onClick={() => { setSelectedServer(server); setIsActivated(false); }}
                        className={`px-5 py-3 rounded-2xl text-[10px] font-black transition-all uppercase tracking-widest ${selectedServer?.name === server.name ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10' : 'border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'} border`}
                      >
                        <Server className="w-3.5 h-3.5 inline mr-2" /> {server.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* REPRODUCTOR WEB PROTEGIDO */}
                <div className="relative aspect-video bg-black rounded-[3rem] overflow-hidden border border-white/5 group shadow-2xl ring-1 ring-white/10">
                  <iframe 
                    src={selectedServer.url}
                    className={`w-full h-full ${!isActivated ? 'opacity-30 blur-sm pointer-events-none' : ''}`}
                    allowFullScreen
                    frameBorder="0"
                  ></iframe>

                  {!isActivated && (
                    <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 backdrop-blur-md z-20">
                      <div className="text-center space-y-8 p-12 web-glass rounded-[3.5rem] border-white/10 max-w-md animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-indigo-600/20 rounded-[1.5rem] flex items-center justify-center mx-auto text-indigo-500 ring-1 ring-indigo-500/30">
                          <Shield className="w-10 h-10" />
                        </div>
                        <div className="space-y-3">
                          <h4 className="text-2xl font-black text-white tracking-tight">Servidor Listo</h4>
                          <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                            Nuestra IA ha preparado el video y activado el filtro anti-anuncios. Pulsa el botón para iniciar la reproducción.
                          </p>
                        </div>
                        <button 
                          onClick={() => setIsActivated(true)}
                          className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-indigo-600/40 hover:scale-[1.02] active:scale-95"
                        >
                          <Zap className="w-5 h-5 fill-current" /> INICIAR PELÍCULA
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-full text-[10px] font-black text-indigo-400 border border-indigo-500/20">
                    <Shield className="w-4 h-4" /> PROTECCIÓN WEB ACTIVA
                  </div>
                </div>

                {/* PROGRESO WEB */}
                <div className="space-y-5 px-6">
                  <div className="flex justify-between text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                    <span>Principio</span>
                    <span className="text-indigo-400 bg-indigo-500/5 px-4 py-1.5 rounded-full border border-indigo-500/20">Sincronizando: {progress}%</span>
                    <span>Final</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="100" value={progress}
                    onChange={handleProgress}
                    className="w-full h-2 bg-zinc-900 rounded-full appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 pt-6">
                <button 
                  onClick={handlePlay}
                  className="px-12 py-6 bg-white text-black font-black rounded-[1.5rem] hover:bg-zinc-200 transition-all flex items-center gap-4 shadow-2xl shadow-white/5 hover:scale-105 active:scale-95"
                >
                  <Play className="w-8 h-8 fill-current" /> 
                  <div className="text-left">
                     <span className="block text-xl leading-none">{progress > 0 ? 'CONTINUAR' : 'VER AHORA'}</span>
                     <span className="text-[10px] opacity-60 tracking-widest font-black">ESTRENO HD</span>
                  </div>
                </button>
                <button 
                  onClick={() => toggleFavorite(movie.id)}
                  className={`px-10 py-6 rounded-[1.5rem] font-black border transition-all flex items-center gap-4 ${user?.favorites.includes(movie.id) ? 'bg-pink-600/10 border-pink-500/30 text-pink-500' : 'bg-zinc-900/50 border-white/5 text-white hover:bg-zinc-800'}`}
                >
                  <Heart className={`w-8 h-8 ${user?.favorites.includes(movie.id) ? 'fill-current' : ''}`} /> 
                  <span className="text-lg uppercase tracking-tighter">MI LISTA</span>
                </button>
                <button className="p-6 rounded-[1.5rem] bg-zinc-900/50 border border-white/5 text-zinc-500 hover:text-white transition-all">
                  <Share2 className="w-8 h-8" />
                </button>
              </div>
            )}

            {/* SINOPSIS & DETALLES WEB */}
            <div className="pt-16 grid md:grid-cols-2 gap-20 border-t border-white/5">
              <div className="space-y-8">
                <h3 className="text-3xl font-black flex items-center gap-3 text-white">
                  <Info className="w-8 h-8 text-indigo-500" /> La Historia
                </h3>
                <p className="text-zinc-400 leading-relaxed text-xl font-medium">{movie.description}</p>
              </div>
              <div className="space-y-10">
                <h3 className="text-3xl font-black text-white">Información Extra</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-zinc-900/30 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Director</p>
                    <p className="text-lg font-bold text-white truncate">{movie.director}</p>
                  </div>
                  <div className="p-6 bg-zinc-900/30 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Año</p>
                    <p className="text-lg font-bold text-white">{movie.year}</p>
                  </div>
                  <div className="col-span-2 p-6 bg-zinc-900/30 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Protagonistas</p>
                    <p className="font-bold text-zinc-300 leading-relaxed">{movie.cast.join(' • ')}</p>
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