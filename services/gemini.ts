
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, SearchResult } from "../types";

// Inicialización con la API Key del entorno
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

const PROMPT_INSTRUCTION = "Responde estrictamente en formato JSON. Para el campo 'links', genera al menos 2 servidores con URLs de ejemplo funcionales tipo embed (ej. https://vidsrc.to/embed/movie/tt1234567).";

export const movieService = {
  async getTrendingMovies(): Promise<Movie[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Genera una lista de 10 películas populares actuales con metadatos completos y enlaces de servidor. ${PROMPT_INSTRUCTION}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA
      }
    });
    return JSON.parse(response.text).movies;
  },

  async getMoviesByCategory(categoryId: string): Promise<Movie[]> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Lista de 12 películas para la categoría: ${categoryId}. ${PROMPT_INSTRUCTION}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: MOVIE_SCHEMA
      }
    });
    return JSON.parse(response.text).movies;
  },

  async searchMovies(query: string): Promise<SearchResult> {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Busca películas y explica por qué son relevantes para: "${query}". ${PROMPT_INSTRUCTION}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          ...MOVIE_SCHEMA,
          properties: {
            ...MOVIE_SCHEMA.properties,
            aiReasoning: { type: Type.STRING, description: "Explicación de por qué estos resultados coinciden con la búsqueda." }
          }
        }
      }
    });
    return JSON.parse(response.text);
  }
};
