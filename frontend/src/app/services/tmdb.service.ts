import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Movie,
  TVShow,
  TMDBResponse,
  MovieDetails,
  TVShowDetails,
  Genre,
  Credits,
  ReviewsResponse,
  VideosResponse,
} from '../models/tmdb.model';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private readonly BASE_URL = environment.tmdbBaseUrl;
  private readonly API_KEY = environment.tmdbApiKey;
  private readonly IMAGE_BASE_URL = environment.tmdbImageBaseUrl;

  constructor(private http: HttpClient) {}

  private getParams(additionalParams: { [key: string]: string } = {}): HttpParams {
    let params = new HttpParams().set('api_key', this.API_KEY);
    Object.keys(additionalParams).forEach((key) => {
      params = params.set(key, additionalParams[key]);
    });
    return params;
  }

  getPosterUrl(path: string | null, size: string = 'w500'): string {
    return path ? `${this.IMAGE_BASE_URL}/${size}${path}` : '/assets/no-image.png';
  }

  getBackdropUrl(path: string | null, size: string = 'original'): string {
    return path ? `${this.IMAGE_BASE_URL}/${size}${path}` : '/assets/no-image.png';
  }

  getTrendingMovies(timeWindow: 'day' | 'week' = 'week'): Observable<TMDBResponse<Movie>> {
    return this.http
      .get<TMDBResponse<Movie>>(`${this.BASE_URL}/trending/movie/${timeWindow}`, {
        params: this.getParams(),
      })
      .pipe(catchError(this.handleError));
  }

  getPopularMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    return this.http
      .get<TMDBResponse<Movie>>(`${this.BASE_URL}/movie/popular`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getTopRatedMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    return this.http
      .get<TMDBResponse<Movie>>(`${this.BASE_URL}/movie/top_rated`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getUpcomingMovies(page: number = 1): Observable<TMDBResponse<Movie>> {
    return this.http
      .get<TMDBResponse<Movie>>(`${this.BASE_URL}/movie/upcoming`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getMovieDetails(movieId: number): Observable<MovieDetails> {
    return this.http
      .get<MovieDetails>(`${this.BASE_URL}/movie/${movieId}`, { params: this.getParams() })
      .pipe(catchError(this.handleError));
  }

  searchMovies(query: string, page: number = 1): Observable<TMDBResponse<Movie>> {
    return this.http
      .get<TMDBResponse<Movie>>(`${this.BASE_URL}/search/movie`, {
        params: this.getParams({ query, page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  searchMulti(query: string, page: number = 1): Observable<TMDBResponse<any>> {
    return this.http
      .get<TMDBResponse<any>>(`${this.BASE_URL}/search/multi`, {
        params: this.getParams({ query, page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getTrendingTVShows(timeWindow: 'day' | 'week' = 'week'): Observable<TMDBResponse<TVShow>> {
    return this.http
      .get<TMDBResponse<TVShow>>(`${this.BASE_URL}/trending/tv/${timeWindow}`, {
        params: this.getParams(),
      })
      .pipe(catchError(this.handleError));
  }

  getPopularTVShows(page: number = 1): Observable<TMDBResponse<TVShow>> {
    return this.http
      .get<TMDBResponse<TVShow>>(`${this.BASE_URL}/tv/popular`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getTopRatedTVShows(page: number = 1): Observable<TMDBResponse<TVShow>> {
    return this.http
      .get<TMDBResponse<TVShow>>(`${this.BASE_URL}/tv/top_rated`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getTVShowDetails(tvId: number): Observable<TVShowDetails> {
    return this.http
      .get<TVShowDetails>(`${this.BASE_URL}/tv/${tvId}`, { params: this.getParams() })
      .pipe(catchError(this.handleError));
  }

  searchTVShows(query: string, page: number = 1): Observable<TMDBResponse<TVShow>> {
    return this.http
      .get<TMDBResponse<TVShow>>(`${this.BASE_URL}/search/tv`, {
        params: this.getParams({ query, page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getMovieGenres(): Observable<{ genres: Genre[] }> {
    return this.http
      .get<{ genres: Genre[] }>(`${this.BASE_URL}/genre/movie/list`, { params: this.getParams() })
      .pipe(catchError(this.handleError));
  }

  getTVGenres(): Observable<{ genres: Genre[] }> {
    return this.http
      .get<{ genres: Genre[] }>(`${this.BASE_URL}/genre/tv/list`, { params: this.getParams() })
      .pipe(catchError(this.handleError));
  }

  discoverMovies(params: { [key: string]: string } = {}): Observable<TMDBResponse<Movie>> {
    return this.http
      .get<TMDBResponse<Movie>>(`${this.BASE_URL}/discover/movie`, {
        params: this.getParams(params),
      })
      .pipe(catchError(this.handleError));
  }

  discoverTVShows(params: { [key: string]: string } = {}): Observable<TMDBResponse<TVShow>> {
    return this.http
      .get<TMDBResponse<TVShow>>(`${this.BASE_URL}/discover/tv`, { params: this.getParams(params) })
      .pipe(catchError(this.handleError));
  }

  getMovieCredits(movieId: number): Observable<Credits> {
    return this.http
      .get<Credits>(`${this.BASE_URL}/movie/${movieId}/credits`, {
        params: this.getParams(),
      })
      .pipe(catchError(this.handleError));
  }

  getTVShowCredits(tvId: number): Observable<Credits> {
    return this.http
      .get<Credits>(`${this.BASE_URL}/tv/${tvId}/credits`, {
        params: this.getParams(),
      })
      .pipe(catchError(this.handleError));
  }

  getMovieReviews(movieId: number, page: number = 1): Observable<ReviewsResponse> {
    return this.http
      .get<ReviewsResponse>(`${this.BASE_URL}/movie/${movieId}/reviews`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getTVShowReviews(tvId: number, page: number = 1): Observable<ReviewsResponse> {
    return this.http
      .get<ReviewsResponse>(`${this.BASE_URL}/tv/${tvId}/reviews`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getSimilarMovies(movieId: number, page: number = 1): Observable<TMDBResponse<Movie>> {
    return this.http
      .get<TMDBResponse<Movie>>(`${this.BASE_URL}/movie/${movieId}/similar`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getSimilarTVShows(tvId: number, page: number = 1): Observable<TMDBResponse<TVShow>> {
    return this.http
      .get<TMDBResponse<TVShow>>(`${this.BASE_URL}/tv/${tvId}/similar`, {
        params: this.getParams({ page: page.toString() }),
      })
      .pipe(catchError(this.handleError));
  }

  getMovieVideos(movieId: number): Observable<VideosResponse> {
    return this.http
      .get<VideosResponse>(`${this.BASE_URL}/movie/${movieId}/videos`, {
        params: this.getParams(),
      })
      .pipe(catchError(this.handleError));
  }

  getTVShowVideos(tvId: number): Observable<VideosResponse> {
    return this.http
      .get<VideosResponse>(`${this.BASE_URL}/tv/${tvId}/videos`, {
        params: this.getParams(),
      })
      .pipe(catchError(this.handleError));
  }

  getProfileUrl(path: string | null, size: string = 'w185'): string {
    return path ? `${this.IMAGE_BASE_URL}/${size}${path}` : '/assets/no-avatar.png';
  }

  private handleError(error: any): Observable<never> {
    console.error('TMDB API Error:', error);
    return throwError(() => error);
  }
}
