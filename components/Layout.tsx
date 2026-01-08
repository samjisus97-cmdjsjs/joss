
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Film, Home, Menu, X, User as UserIcon, LogOut, Database, LayoutGrid } from 'lucide-react';
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
      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-indigo-600 rounded-lg group-hover:scale-110 transition-transform">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">CineAI</span>
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link to="/" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium">Inicio</Link>
                <Link to="/catalog" className="text-zinc-400 hover:text-white transition-colors text-sm font-medium flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4" /> Catálogo
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-amber-400 hover:text-amber-300 transition-colors text-sm font-bold flex items-center gap-2">
                    <Database className="w-4 h-4" /> Admin
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="¿Qué quieres ver?"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-2 p-1 bg-zinc-900 border border-zinc-800 rounded-full">
                    <img src={user?.avatar} alt="Avatar" className="w-7 h-7 rounded-full" />
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-2 overflow-hidden">
                      <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-400 hover:text-white hover:bg-zinc-800">
                        <UserIcon className="w-4 h-4" /> Perfil
                      </Link>
                      <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-400/10 w-full text-left font-bold">
                        <LogOut className="w-4 h-4" /> Salir
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="px-5 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-zinc-200">Entrar</Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
};

export default Layout;
