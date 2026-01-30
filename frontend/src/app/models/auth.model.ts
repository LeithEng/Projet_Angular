export interface User {
  id: string;
  email: string;
  username: string;
  profilePicture?: string;
  favoriteMovies?: number[];
  favoriteTvShows?: number[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
}

export interface UpdateProfileRequest {
  username?: string;
  profilePicture?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface FavoritesResponse {
  movies: number[];
  tvShows: number[];
}
