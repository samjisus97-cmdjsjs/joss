
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
// Fix: Added useNavigate to imports to resolve the navigate reference error
import { Navigate, useNavigate } from 'react-router-dom';
import { Settings, LogOut, Heart, Eye, Bookmark, Award, Calendar, FileText, User as UserIcon } from 'lucide-react';
import MovieCard from '../components/MovieCard';

const Profile: React.FC = () => {
  // Fix: Initialized navigate using useNavigate hook
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, globalMovies } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Filtrar las películas favoritas del catálogo global
  const favoriteMovies = globalMovies.filter(m => user?.favorites.includes(m.id));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center sticky top-24">
            <div className="relative inline-block mb-6">
               <img src={user?.avatar} alt={user?.name} className="w-32 h-32 rounded-full border-4 border-indigo-600 mx-auto bg-zinc-800 shadow-2xl shadow-indigo-600/20" />
               <div className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full border-4 border-zinc-900">
                  <Award className="w-4 h-4 text-white" />
               </div>
            </div>
            <h2 className="text-2xl font-black text-white mb-1">{user?.name}</h2>
            <p className="text-zinc-500 text-sm font-medium mb-8">{user?.email}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-zinc-950 rounded-2xl border border-zinc-800 text-left">
                <Calendar className="w-5 h-5 text-indigo-500" />
                <div>
                   <p className="text-[10px] font-black text-zinc-500 uppercase">Miembro desde</p>
                   <p className="text-sm font-bold text-zinc-300">{user?.joinedDate}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-zinc-800">
              <button onClick={logout} className="flex items-center justify-center gap-2 w-full py-4 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-2xl transition-all text-sm font-black uppercase tracking-widest">
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-xl">
              <Heart className="w-8 h-8 text-pink-500 mb-4 fill-current opacity-20" />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Favoritos</p>
              <p className="text-4xl font-black text-white mt-1">{user?.favorites.length || 0}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-xl">
              <Eye className="w-8 h-8 text-indigo-500 mb-4 fill-current opacity-20" />
              <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Rol</p>
              <p className="text-xl font-black text-white mt-1 uppercase tracking-tighter">{user?.role === 'admin' ? 'Administrador' : 'Explorador'}</p>
            </div>
          </div>

          <section className="bg-zinc-900/30 border border-zinc-800/50 rounded-[3rem] p-10 min-h-[50vh]">
            <div className="flex items-center justify-between mb-8">
               <h3 className="text-3xl font-black text-white">Mi Colección Privada</h3>
               <span className="text-zinc-500 text-sm font-bold">{favoriteMovies.length} Películas</span>
            </div>
            
            {favoriteMovies.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                {favoriteMovies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="py-32 text-center">
                <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-800">
                  <Bookmark className="w-10 h-10 text-zinc-700" />
                </div>
                <h4 className="text-xl font-bold text-zinc-400 mb-2">Tu lista está vacía</h4>
                <p className="text-zinc-600 font-medium max-w-xs mx-auto">Explora el catálogo y añade películas a tus favoritos para verlas aquí.</p>
                <button 
                   onClick={() => navigate('/')}
                   className="mt-8 px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
                >
                   Explorar Catálogo
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
