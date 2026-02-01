const Map<String, Object> environment = {
  'production': false,
  'apiUrl': '/api', //'http://localhost:3000',
  'tmdbApiKey': '0ec8764a109b727d05b2b31d218d6099',
  'tmdbBaseUrl': 'https://api.themoviedb.org/3',
  'tmdbImageBaseUrl': 'https://image.tmdb.org/t/p',
};

class Environment {
  static bool get production => environment['production'] as bool;
  static String get apiUrl => environment['apiUrl'] as String;
  static String get tmdbApiKey => environment['tmdbApiKey'] as String;
  static String get tmdbBaseUrl => environment['tmdbBaseUrl'] as String;
  static String get tmdbImageBaseUrl =>
      environment['tmdbImageBaseUrl'] as String;
}
