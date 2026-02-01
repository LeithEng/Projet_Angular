/*
TMDBResponse<T> - Generic response wrapper
Movie - Movie model
TVShow - TV show model
SearchResult - Multi-search result model
Genre - Genre model
MovieDetails - Detailed movie information
*/
class TMDBResponse<T> {
  final int page;
  final List<T> results;
  final int totalPages;
  final int totalResults;

  TMDBResponse({
    required this.page,
    required this.results,
    required this.totalPages,
    required this.totalResults,
  });

  factory TMDBResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return TMDBResponse<T>(
      page: json['page'] ?? 1,
      results: (json['results'] as List?)
              ?.map((item) => fromJsonT(item as Map<String, dynamic>))
              .toList() ??
          [],
      totalPages: json['total_pages'] ?? 0,
      totalResults: json['total_results'] ?? 0,
    );
  }
}

class Movie {
  final int id;
  final String title;
  final String? overview;
  final String? posterPath;
  final String? backdropPath;
  final double voteAverage;
  final int voteCount;
  final String? releaseDate;
  final List<int> genreIds;
  final bool adult;
  final String originalLanguage;
  final String originalTitle;
  final double popularity;
  final bool video;

  Movie({
    required this.id,
    required this.title,
    this.overview,
    this.posterPath,
    this.backdropPath,
    required this.voteAverage,
    required this.voteCount,
    this.releaseDate,
    required this.genreIds,
    required this.adult,
    required this.originalLanguage,
    required this.originalTitle,
    required this.popularity,
    required this.video,
  });

  factory Movie.fromJson(Map<String, dynamic> json) {
    return Movie(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      overview: json['overview'],
      posterPath: json['poster_path'],
      backdropPath: json['backdrop_path'],
      voteAverage: (json['vote_average'] ?? 0).toDouble(),
      voteCount: json['vote_count'] ?? 0,
      releaseDate: json['release_date'],
      genreIds: (json['genre_ids'] as List?)?.cast<int>() ?? [],
      adult: json['adult'] ?? false,
      originalLanguage: json['original_language'] ?? '',
      originalTitle: json['original_title'] ?? '',
      popularity: (json['popularity'] ?? 0).toDouble(),
      video: json['video'] ?? false,
    );
  }
}

class TVShow {
  final int id;
  final String name;
  final String? overview;
  final String? posterPath;
  final String? backdropPath;
  final double voteAverage;
  final int voteCount;
  final String? firstAirDate;
  final List<int> genreIds;
  final List<String> originCountry;
  final String originalLanguage;
  final String originalName;
  final double popularity;

  TVShow({
    required this.id,
    required this.name,
    this.overview,
    this.posterPath,
    this.backdropPath,
    required this.voteAverage,
    required this.voteCount,
    this.firstAirDate,
    required this.genreIds,
    required this.originCountry,
    required this.originalLanguage,
    required this.originalName,
    required this.popularity,
  });

  factory TVShow.fromJson(Map<String, dynamic> json) {
    return TVShow(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
      overview: json['overview'],
      posterPath: json['poster_path'],
      backdropPath: json['backdrop_path'],
      voteAverage: (json['vote_average'] ?? 0).toDouble(),
      voteCount: json['vote_count'] ?? 0,
      firstAirDate: json['first_air_date'],
      genreIds: (json['genre_ids'] as List?)?.cast<int>() ?? [],
      originCountry: (json['origin_country'] as List?)?.cast<String>() ?? [],
      originalLanguage: json['original_language'] ?? '',
      originalName: json['original_name'] ?? '',
      popularity: (json['popularity'] ?? 0).toDouble(),
    );
  }
}

class SearchResult {
  final int id;
  final String mediaType;
  final String title;
  final String? overview;
  final String? posterPath;
  final String? backdropPath;
  final double voteAverage;
  final int voteCount;
  final String? releaseDate;
  final double popularity;

  SearchResult({
    required this.id,
    required this.mediaType,
    required this.title,
    this.overview,
    this.posterPath,
    this.backdropPath,
    required this.voteAverage,
    required this.voteCount,
    this.releaseDate,
    required this.popularity,
  });

  factory SearchResult.fromJson(Map<String, dynamic> json) {
    final mediaType = json['media_type'] ?? '';
    return SearchResult(
      id: json['id'] ?? 0,
      mediaType: mediaType,
      title:
          mediaType == 'movie' ? (json['title'] ?? '') : (json['name'] ?? ''),
      overview: json['overview'],
      posterPath: json['poster_path'],
      backdropPath: json['backdrop_path'],
      voteAverage: (json['vote_average'] ?? 0).toDouble(),
      voteCount: json['vote_count'] ?? 0,
      releaseDate:
          mediaType == 'movie' ? json['release_date'] : json['first_air_date'],
      popularity: (json['popularity'] ?? 0).toDouble(),
    );
  }
}

class Genre {
  final int id;
  final String name;

  Genre({required this.id, required this.name});

  factory Genre.fromJson(Map<String, dynamic> json) {
    return Genre(
      id: json['id'] ?? 0,
      name: json['name'] ?? '',
    );
  }
}

class MovieDetails extends Movie {
  final List<Genre> genres;
  final int? runtime;
  final String? status;
  final String? tagline;
  final int? budget;
  final int? revenue;

  MovieDetails({
    required super.id,
    required super.title,
    super.overview,
    super.posterPath,
    super.backdropPath,
    required super.voteAverage,
    required super.voteCount,
    super.releaseDate,
    required super.genreIds,
    required super.adult,
    required super.originalLanguage,
    required super.originalTitle,
    required super.popularity,
    required super.video,
    required this.genres,
    this.runtime,
    this.status,
    this.tagline,
    this.budget,
    this.revenue,
  });

  factory MovieDetails.fromJson(Map<String, dynamic> json) {
    return MovieDetails(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      overview: json['overview'],
      posterPath: json['poster_path'],
      backdropPath: json['backdrop_path'],
      voteAverage: (json['vote_average'] ?? 0).toDouble(),
      voteCount: json['vote_count'] ?? 0,
      releaseDate: json['release_date'],
      genreIds: (json['genre_ids'] as List?)?.cast<int>() ?? [],
      adult: json['adult'] ?? false,
      originalLanguage: json['original_language'] ?? '',
      originalTitle: json['original_title'] ?? '',
      popularity: (json['popularity'] ?? 0).toDouble(),
      video: json['video'] ?? false,
      genres:
          (json['genres'] as List?)?.map((g) => Genre.fromJson(g)).toList() ??
              [],
      runtime: json['runtime'],
      status: json['status'],
      tagline: json['tagline'],
      budget: json['budget'],
      revenue: json['revenue'],
    );
  }
}
