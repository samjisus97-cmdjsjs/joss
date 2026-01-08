
const TMDB_API_KEY = '1076ac03cba68c1680094495c8506ad7';
const BASE_URL = 'https://api.themoviedb.org/3';

export const tmdbService = {
  async getMetadataByImdbId(imdbId: string) {
    try {
      // 1. Encontrar ID de TMDB usando ID de IMDb
      const findRes = await fetch(
        `${BASE_URL}/find/${imdbId}?api_key=${TMDB_API_KEY}&external_source=imdb_id&language=es-ES`
      );
      const findData = await findRes.json();
      
      const movieResult = findData.movie_results?.[0];
      if (!movieResult) return null;

      // 2. Obtener detalles extendidos (créditos y duración)
      const detailRes = await fetch(
        `${BASE_URL}/movie/${movieResult.id}?api_key=${TMDB_API_KEY}&append_to_response=credits&language=es-ES`
      );
      const detail = await detailRes.json();

      return {
        id: String(detail.id),
        imdbId: imdbId,
        title: detail.title,
        year: new Date(detail.release_date).getFullYear(),
        rating: detail.vote_average,
        duration: `${detail.runtime} min`,
        genre: detail.genres.map((g: any) => g.name),
        description: detail.overview,
        posterUrl: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '',
        backdropUrl: detail.backdrop_path ? `https://image.tmdb.org/t/p/original${detail.backdrop_path}` : '',
        director: detail.credits.crew.find((c: any) => c.job === 'Director')?.name || 'Desconocido',
        cast: detail.credits.cast.slice(0, 5).map((c: any) => c.name)
      };
    } catch (error) {
      console.error("TMDB Fetch Error:", error);
      return null;
    }
  }
};
