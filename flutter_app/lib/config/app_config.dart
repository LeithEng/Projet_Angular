class AppConfig {
  static const String apiBaseUrl = 'http://localhost:3000';

  // API Endpoints
  static const String authEndpoint = '$apiBaseUrl/auth';
  static const String usersEndpoint = '$apiBaseUrl/users';

  // Storage Keys
  static const String tokenKey = 'access_token';
  static const String userKey = 'current_user';

  // TMDB Config
  static const String tmdbApiKey = '0ec8764a109b727d05b2b31d218d6099';
  static const String tmdbBaseUrl = 'https://api.themoviedb.org/3';
  static const String tmdbImageBaseUrl = 'https://image.tmdb.org/t/p';
}
