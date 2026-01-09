
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, SearchResult } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_API_KEY });

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
          backdropUrl: { type: Type.STRING },
          director: { type: Type.STRING },
          cast: { type: Type.ARRAY, items: { type: Type.STRING } },
          links: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                language: { type: Type.STRING },
                servers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING },
                      url: { type: Type.STRING }
                    }
                  }
                }
              }
            }
          }
        },
        required: ["id", "title", "year", "rating", "genre", "description", "posterUrl", "links"]
      }
    }
  },
  required: ["movies"]
};

// Prompt base para inyectar enlaces de ejemplo seguros
const PROMPT_INSTRUCTION = "Devuelve los resultados en JSON. Para el campo 'links', genera al menos 2 servidores ficticios pero con formato de URL de embed real (ej. https://vidsrc.to/embed/movie/tt1234567 o similar).";

export const movieService = {
  async getTrendingMovies(): Promise<Movie[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera 10 películas actuales populares. ${PROMPT_INSTRUCTION}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA
      }
    });
    const result = JSON.parse(response.text);
    return result.movies;
  },

  async getMoviesByCategory(categoryId: string): Promise<Movie[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera 12 películas del género: ${categoryId}. ${PROMPT_INSTRUCTION}`,
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
      model: 'gemini-3-flash-preview',
      contents: `Busca películas relacionadas con: "${query}". ${PROMPT_INSTRUCTION}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          ...MOVIE_SCHEMA,
          properties: { ...MOVIE_SCHEMA.properties, aiReasoning: { type: Type.STRING } }
        }
      }
    });
    return JSON.parse(response.text) as SearchResult;
  }
};
