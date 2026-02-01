import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ReviewAuthorDetails {
  name: string;
  username: string;
  profile_image?: string | null;
  rating?: number | null;
}

export interface CreateReviewRequest {
  movie_id: string;
  author: string;
  author_details: ReviewAuthorDetails;
  content: string;
  url?: string;
}

export interface ReviewResponse {
  id: string;
  movie_id: string;
  author: string;
  author_details: ReviewAuthorDetails;
  content: string;
  created_at: string;
  updated_at: string;
  url?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private readonly API_URL = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  createReview(review: CreateReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.API_URL, review);
  }

  getReviewsByMovieId(movieId: string): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(`${this.API_URL}/movie/${movieId}`);
  }

  getAllReviews(): Observable<ReviewResponse[]> {
    return this.http.get<ReviewResponse[]>(this.API_URL);
  }

  deleteReview(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
