
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Film, Home, User as UserIcon, LogOut, Database, LayoutGrid, Github, Twitter, Instagram, Mail } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#09090b]">
      {/* HEADER DE SITIO WEB */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-10">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="p-2.5 bg-indigo-600 rounded-xl group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-600/20">
                  <Film className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-white">CineAI</span>
              </Link>
              
              <div className="hidden lg:flex items-center gap-8">
                <Link to="/" className="text-zinc-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">Inicio</Link>
                <Link to="/catalog" className="text-zinc-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">Películas</Link>
                <Link to="/category/accion" className="text-zinc-400 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">Acción</Link>
                {isAdmin && (
                  <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 transition-all text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    <Database className="w-4 h-4" /> Panel Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="flex-1 max-w-xl mx-12 hidden md:block">
              <form onSubmit={handleSearch} className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Busca por título, género o actor..."
                  className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:bg-zinc-900 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center gap-6">
              {isAuthenticated ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-3 p-1.5 bg-zinc-900/50 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors"
                  >
                    <img src={user?.avatar} alt="Avatar" className="w-8 h-8 rounded-xl object-cover" />
                    <span className="text-sm font-bold text-zinc-300 hidden sm:inline pr-2">{user?.name}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-[1.5rem] shadow-2xl py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">
                        <UserIcon className="w-4 h-4" /> Mi Perfil
                      </Link>
                      <div className="h-px bg-zinc-800 mx-5 my-2" />
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="flex items-center gap-3 px-5 py-3 text-sm text-red-400 hover:bg-red-400/5 w-full text-left font-bold transition-colors">
                        <LogOut className="w-4 h-4" /> Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="px-8 py-3 bg-white text-black text-sm font-black rounded-2xl hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5">
                  ENTRAR
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1">{children}</main>

      {/* FOOTER DE SITIO WEB */}
      <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10">
        <div className="max-w-screen-2xl mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 rounded-lg">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-black tracking-tighter text-white">CineAI</span>
              </div>
              <p className="text-zinc-500 text-sm leading-relaxed font-medium">
                La nueva generación de streaming impulsada por IA. Disfruta del mejor contenido con seguridad y calidad cinematográfica.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-indigo-600 transition-all"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-indigo-600 transition-all"><Twitter className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-indigo-600 transition-all"><Github className="w-5 h-5" /></a>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Catálogo</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><Link to="/catalog" className="hover:text-indigo-400 transition-colors">Todas las Películas</Link></li>
                <li><Link to="/category/accion" className="hover:text-indigo-400 transition-colors">Acción y Aventura</Link></li>
                <li><Link to="/category/drama" className="hover:text-indigo-400 transition-colors">Drama</Link></li>
                <li><Link to="/category/sci-fi" className="hover:text-indigo-400 transition-colors">Ciencia Ficción</Link></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Soporte</h4>
              <ul className="space-y-4 text-sm font-bold text-zinc-500">
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Preguntas Frecuentes</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Privacidad</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Términos de Uso</a></li>
                <li><a href="#" className="hover:text-indigo-400 transition-colors">Contacto</a></li>
              </ul>
            </div>

            <div className="space-y-6">
              <h4 className="text-white font-black uppercase tracking-widest text-xs">Boletín</h4>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">Suscríbete para recibir novedades sobre los últimos estrenos.</p>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Tu correo electrónico" 
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500 transition-colors" 
                />
                <button className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-zinc-600 text-xs font-bold">© 2024 CineAI Web Services. Todos los derechos reservados.</p>
            <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-600">
              <a href="#" className="hover:text-zinc-400">DMCA</a>
              <a href="#" className="hover:text-zinc-400">COOKIES</a>
              <a href="#" className="hover:text-zinc-400">ADS PROTECTION</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;