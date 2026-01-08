
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, SearchResult } from "../types";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOVIE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    movies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          year: { type: Type.INTEGER },
          rating: { type: Type.NUMBER },
          duration: { type: Type.STRING },
          genre: { type: Type.ARRAY, items: { type: Type.STRING } },
          description: { type: Type.STRING },
          posterUrl: { type: Type.STRING },
          director: { type: Type.STRING },
          cast: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["id", "title", "year", "rating", "genre", "description", "posterUrl"]
      }
    }
  },
  required: ["movies"]
};

export const movieService = {
  async getTrendingMovies(): Promise<Movie[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Genera una lista de 8 películas populares actuales con metadatos completos en formato JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA
      }
    });
    // Extract text directly from response.text property
    const result = JSON.parse(response.text);
    return result.movies;
  },

  // Fix: Added missing getMoviesByCategory method required by CategoryPage
  async getMoviesByCategory(categoryId: string): Promise<Movie[]> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Genera una lista de 8 películas populares del género o categoría: "${categoryId}" con metadatos completos en formato JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA
      }
    });
    const result = JSON.parse(response.text);
    return result.movies;
  },

  async searchMovies(query: string): Promise<SearchResult> {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Busca películas relacionadas con: "${query}". Devuelve resultados y una breve explicación en 'aiReasoning'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          ...MOVIE_SCHEMA,
          properties: { ...MOVIE_SCHEMA.properties, aiReasoning: { type: Type.STRING } }
        }
      }
    });
    return JSON.parse(response.text) as SearchResult;
  },

  async processMovieBatch(movieData: {title: string, embedUrl: string}[]): Promise<Movie[]> {
    const titles = movieData.map(m => m.title).join(", ");
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Procesa esta lista de títulos: ${titles}. Genera metadatos realistas (poster, descripción, año, etc.). Responde estrictamente en JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA
      }
    });

    try {
      const result = JSON.parse(response.text);
      const generatedMovies: Movie[] = result.movies || [];
      
      // Mapear los enlaces embed de vuelta a las películas generadas por la IA
      return generatedMovies.map(movie => {
        const original = movieData.find(m => 
          m.title.toLowerCase().includes(movie.title.toLowerCase()) || 
          movie.title.toLowerCase().includes(m.title.toLowerCase())
        );
        return {
          ...movie,
          videoUrl: original?.embedUrl || ""
        };
      });
    } catch (e) {
      console.error("Error processing batch:", e);
      return [];
    }
  }
};
