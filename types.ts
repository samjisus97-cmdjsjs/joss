
export interface ServerLink {
  name: string;
  url: string;
}

export interface LanguageGroup {
  language: string;
  servers: ServerLink[];
}

export interface Movie {
  id: string;
  imdbId?: string;
  title: string;
  year: number;
  rating: number;
  duration: string;
  genre: string[];
  description: string;
  posterUrl: string;
  backdropUrl?: string;
  director: string;
  cast: string[];
  links: LanguageGroup[];
}

export interface ViewingProgress {
  movieId: string;
  movieTitle: string;
  posterUrl: string;
  lastPlayed: number; // Timestamp
  progressPercentage: number; // 0 to 100
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  favorites: string[];
  userMovies: Movie[];
  joinedDate: string;
  role: 'admin' | 'user';
  continueWatching: ViewingProgress[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export type SearchResult = {
  movies: Movie[];
  aiReasoning?: string;
};
