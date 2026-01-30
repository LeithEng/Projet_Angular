import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  UpdatePasswordRequest,
  FavoritesResponse,
} from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth`;
  private readonly USERS_URL = `${environment.apiUrl}/users`;
  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'current_user';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();
  currentUserSignal = signal<User | null>(this.getUserFromStorage());

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, data).pipe(
      tap((response) => {
        this.storeAuthData(response);
      }),
      catchError((error) => {
        console.error('Registration error:', error);
        return throwError(() => error);
      }),
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/login`, data).pipe(
      tap((response) => {
        this.storeAuthData(response);
      }),
      catchError((error) => {
        console.error('Login error:', error);
        return throwError(() => error);
      }),
    );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/login']);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.USERS_URL}/profile`).pipe(
      tap((user) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.currentUserSignal.set(user);
      }),
    );
  }

  updateProfile(data: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.USERS_URL}/profile`, data).pipe(
      tap((user) => {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.currentUserSignal.set(user);
      }),
    );
  }

  updatePassword(data: UpdatePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.USERS_URL}/password`, data);
  }

  toggleFavorite(
    contentId: number,
    contentType: 'movie' | 'tv',
  ): Observable<{ isFavorite: boolean }> {
    return this.http
      .post<{ isFavorite: boolean }>(`${this.USERS_URL}/favorites/toggle`, {
        contentId,
        contentType,
      })
      .pipe(
        tap(() => {
          // Refresh user profile to update favorites
          this.getProfile().subscribe();
        }),
      );
  }

  getFavorites(): Observable<FavoritesResponse> {
    return this.http.get<FavoritesResponse>(`${this.USERS_URL}/favorites`);
  }

  verifyToken(): Observable<any> {
    return this.http.get(`${this.API_URL}/verify`);
  }

  private storeAuthData(data: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, data.access_token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    this.currentUserSubject.next(data.user);
    this.currentUserSignal.set(data.user);
  }
}
