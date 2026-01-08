
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Movie, ViewingProgress } from '../types';
import { dbService } from '../services/db';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  toggleFavorite: (movieId: string) => void;
  updatePlaybackProgress: (movie: Movie, percentage: number) => Promise<void>;
  continueWatching: ViewingProgress[];
  isAuthenticated: boolean;
  isAdmin: boolean;
  globalMovies: Movie[];
  addMoviesToGlobal: (movies: Movie[]) => Promise<void>;
  refreshGlobalMovies: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const ADMIN_EMAIL = "samjisus97@gmail.com"; 

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [globalMovies, setGlobalMovies] = useState<Movie[]>([]);
  const [continueWatching, setContinueWatching] = useState<ViewingProgress[]>([]);

  const refreshGlobalMovies = useCallback(async () => {
    const paged = await dbService.getMoviesPaged(0, 50);
    setGlobalMovies(paged);
    const progress = await dbService.getAllProgress();
    setContinueWatching(progress);
  }, []);

  useEffect(() => {
    const activeSession = localStorage.getItem('cineai_session');
    if (activeSession) {
      try {
        const sessionUser = JSON.parse(activeSession);
        const users = getUsersDB();
        const freshUser = users.find(u => u.id === sessionUser.id);
        setUser(freshUser || sessionUser);
      } catch (e) {
        localStorage.removeItem('cineai_session');
      }
    }
    refreshGlobalMovies();
  }, [refreshGlobalMovies]);

  const getUsersDB = (): User[] => {
    const db = localStorage.getItem('cineai_users_db');
    return db ? JSON.parse(db) : [];
  };

  const updatePlaybackProgress = async (movie: Movie, percentage: number) => {
    const progress: ViewingProgress = {
      movieId: movie.id,
      movieTitle: movie.title,
      posterUrl: movie.posterUrl,
      lastPlayed: Date.now(),
      progressPercentage: percentage
    };
    await dbService.saveProgress(progress);
    const updated = await dbService.getAllProgress();
    setContinueWatching(updated);
  };

  const toggleFavorite = (movieId: string) => {
    if (!user) return;
    const isFavorite = user.favorites.includes(movieId);
    const updatedUser = { 
      ...user, 
      favorites: isFavorite ? user.favorites.filter(id => id !== movieId) : [...user.favorites, movieId] 
    };
    setUser(updatedUser);
    const users = getUsersDB();
    const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    localStorage.setItem('cineai_users_db', JSON.stringify(updatedUsers));
    localStorage.setItem('cineai_session', JSON.stringify(updatedUser));
  };

  const register = (name: string, email: string, password: string) => {
    const users = getUsersDB();
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, message: "Este correo ya existe." };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      name, email: email.toLowerCase(), password,
      favorites: [], userMovies: [], continueWatching: [],
      joinedDate: new Date().toLocaleDateString(),
      role: email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`
    };
    localStorage.setItem('cineai_users_db', JSON.stringify([...users, newUser]));
    setUser(newUser);
    localStorage.setItem('cineai_session', JSON.stringify(newUser));
    return { success: true, message: "OK" };
  };

  const login = (email: string, password: string) => {
    const users = getUsersDB();
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!found) return { success: false, message: "Credenciales inválidas" };
    setUser(found);
    localStorage.setItem('cineai_session', JSON.stringify(found));
    return { success: true, message: "OK" };
  };

  const logout = () => { setUser(null); localStorage.removeItem('cineai_session'); };

  const addMoviesToGlobal = async (newMovies: Movie[]) => {
    await dbService.addMovies(newMovies);
    await refreshGlobalMovies();
  };

  return (
    <AuthContext.Provider value={{ 
      user, login, register, logout, toggleFavorite,
      updatePlaybackProgress, continueWatching,
      isAuthenticated: !!user, isAdmin: user?.role === 'admin',
      globalMovies, addMoviesToGlobal, refreshGlobalMovies
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth error');
  return context;
};
