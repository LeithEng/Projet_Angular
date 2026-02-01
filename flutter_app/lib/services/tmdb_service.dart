/*getTrendingMovies() - Get trending movies
getPopularMovies() - Get popular movies
getTopRatedMovies() - Get top rated movies
getUpcomingMovies() - Get upcoming movies
searchMovies() - Search for movies
searchMulti() - Search for movies and TV shows
getTrendingTVShows() - Get trending TV shows
getPosterUrl() - Get poster image URL
getBackdropUrl() - Get backdrop image URL*/
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/tmdb_models.dart';
import '../config/environment.dart';

class TmdbService {
  final String _baseUrl = Environment.tmdbBaseUrl;
  final String _apiKey = Environment.tmdbApiKey;
  final String _imageBaseUrl = Environment.tmdbImageBaseUrl;

  Map<String, String> _getParams([Map<String, String>? additionalParams]) {
    final params = {'api_key': _apiKey};
    if (additionalParams != null) {
      params.addAll(additionalParams);
    }
    return params;
  }

  String getPosterUrl(String? path, {String size = 'w500'}) {
    return path != null ? '$_imageBaseUrl/$size$path' : 'assets/no-image.png';
  }

  String getBackdropUrl(String? path, {String size = 'original'}) {
    return path != null ? '$_imageBaseUrl/$size$path' : 'assets/no-image.png';
  }

  Future<TMDBResponse<Movie>> getTrendingMovies({
    String timeWindow = 'week',
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/trending/movie/$timeWindow')
          .replace(queryParameters: _getParams());
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => Movie.fromJson(item),
        );
      } else {
        throw Exception(
            'Failed to load trending movies: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching trending movies: $e');
    }
  }

  Future<TMDBResponse<Movie>> getPopularMovies({int page = 1}) async {
    try {
      final uri = Uri.parse('$_baseUrl/movie/popular')
          .replace(queryParameters: _getParams({'page': page.toString()}));
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => Movie.fromJson(item),
        );
      } else {
        throw Exception(
            'Failed to load popular movies: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching popular movies: $e');
    }
  }

  Future<TMDBResponse<Movie>> getTopRatedMovies({int page = 1}) async {
    try {
      final uri = Uri.parse('$_baseUrl/movie/top_rated')
          .replace(queryParameters: _getParams({'page': page.toString()}));
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => Movie.fromJson(item),
        );
      } else {
        throw Exception(
            'Failed to load top rated movies: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching top rated movies: $e');
    }
  }

  Future<TMDBResponse<Movie>> getUpcomingMovies({int page = 1}) async {
    try {
      final uri = Uri.parse('$_baseUrl/movie/upcoming')
          .replace(queryParameters: _getParams({'page': page.toString()}));
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => Movie.fromJson(item),
        );
      } else {
        throw Exception(
            'Failed to load upcoming movies: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching upcoming movies: $e');
    }
  }

  Future<MovieDetails> getMovieDetails(int movieId) async {
    try {
      final uri = Uri.parse('$_baseUrl/movie/$movieId')
          .replace(queryParameters: _getParams());
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return MovieDetails.fromJson(json);
      } else {
        throw Exception('Failed to load movie details: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching movie details: $e');
    }
  }

  Future<TMDBResponse<Movie>> searchMovies(String query, {int page = 1}) async {
    try {
      final uri = Uri.parse('$_baseUrl/search/movie').replace(
        queryParameters: _getParams({
          'query': query,
          'page': page.toString(),
        }),
      );
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => Movie.fromJson(item),
        );
      } else {
        throw Exception('Failed to search movies: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error searching movies: $e');
    }
  }

  Future<TMDBResponse<SearchResult>> searchMulti(String query,
      {int page = 1}) async {
    try {
      final uri = Uri.parse('$_baseUrl/search/multi').replace(
        queryParameters: _getParams({
          'query': query,
          'page': page.toString(),
        }),
      );
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => SearchResult.fromJson(item),
        );
      } else {
        throw Exception('Failed to search: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error searching: $e');
    }
  }

  Future<TMDBResponse<TVShow>> getTrendingTVShows({
    String timeWindow = 'week',
  }) async {
    try {
      final uri = Uri.parse('$_baseUrl/trending/tv/$timeWindow')
          .replace(queryParameters: _getParams());
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => TVShow.fromJson(item),
        );
      } else {
        throw Exception(
            'Failed to load trending TV shows: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching trending TV shows: $e');
    }
  }

  Future<TMDBResponse<TVShow>> getPopularTVShows({int page = 1}) async {
    try {
      final uri = Uri.parse('$_baseUrl/tv/popular')
          .replace(queryParameters: _getParams({'page': page.toString()}));
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final json = jsonDecode(response.body);
        return TMDBResponse.fromJson(
          json,
          (item) => TVShow.fromJson(item),
        );
      } else {
        throw Exception(
            'Failed to load popular TV shows: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('Error fetching popular TV shows: $e');
    }
  }
}
