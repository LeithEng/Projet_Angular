import { Observable, of } from "rxjs";
import { FETCH_TYPE } from "../constants/fetch-type.const";
import { TmdbService } from "../services/tmdb.service";
import { FetchCriteria } from "../interfaces/fetch-criteria.interface";
import { CONTENT_TYPE } from "../constants/content-type.const";
import { Movie, TMDBResponse, TVShow } from "../models/tmdb.model";


const EMPTY_RESPONSE: TMDBResponse<any> = {
  results: [],
  page: 0,            
  total_pages: 0,
  total_results: 0  
};


export function executeFetchStrategy(
  service: TmdbService, 
  criteria: FetchCriteria, 
  page: number
): Observable<TMDBResponse<Movie | TVShow>> {
  
  const { type, cType, genre } = criteria;
  
  
  const params: Record<string, string> = { 
    page: page.toString() 
  };

  if (genre) {
    params['with_genres'] = genre;
  }

  // 1. Safety Guard
  if (page > 500) return of(EMPTY_RESPONSE);

  const strategies: Record<string, () => Observable<any>> = {
    // --- MOVIES ---
    [`${CONTENT_TYPE.MOVIE}_${FETCH_TYPE.TRENDING}`]:  () => service.getTrendingMovies(),
    [`${CONTENT_TYPE.MOVIE}_${FETCH_TYPE.TOP_RATED}`]: () => service.getTopRatedMovies(page),
    [`${CONTENT_TYPE.MOVIE}_${FETCH_TYPE.POPULAR}`]:   () => service.getPopularMovies(page),
    [`${CONTENT_TYPE.MOVIE}_${FETCH_TYPE.GENRE}`]:      () => service.discoverMovies(params),

    // --- TV SHOWS ---
    [`${CONTENT_TYPE.TV}_${FETCH_TYPE.TRENDING}`]:  () => service.getTrendingTVShows(),
    [`${CONTENT_TYPE.TV}_${FETCH_TYPE.TOP_RATED}`]: () => service.getTopRatedTVShows(page),
    [`${CONTENT_TYPE.TV}_${FETCH_TYPE.POPULAR}`]:   () => service.getPopularTVShows(page),
    [`${CONTENT_TYPE.TV}_${FETCH_TYPE.GENRE}`]:      () => service.discoverTVShows(params),
  };

  // 3. Select and Execute
  const key = `${cType}_${type}`;
  const strategy = strategies[key];

  if (strategy) {
    return strategy();
  }

  console.warn(`[TmdbFetchStrategy] No strategy found for key: ${key}`);
  return of(EMPTY_RESPONSE);
}