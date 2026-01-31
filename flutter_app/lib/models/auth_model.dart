class User {
  final String id;
  final String email;
  final String username;
  final String? profilePicture;
  final List<int> favoriteMovies;
  final List<int> favoriteTvShows;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.email,
    required this.username,
    this.profilePicture,
    this.favoriteMovies = const [],
    this.favoriteTvShows = const [],
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? json['_id'] ?? '',
      email: json['email'] ?? '',
      username: json['username'] ?? '',
      profilePicture: json['profilePicture'],
      favoriteMovies: json['favoriteMovies'] != null
          ? List<int>.from(json['favoriteMovies'])
          : [],
      favoriteTvShows: json['favoriteTvShows'] != null
          ? List<int>.from(json['favoriteTvShows'])
          : [],
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'profilePicture': profilePicture,
      'favoriteMovies': favoriteMovies,
      'favoriteTvShows': favoriteTvShows,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class AuthResponse {
  final String accessToken;
  final User user;

  AuthResponse({
    required this.accessToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['access_token'] ?? json['accessToken'] ?? '',
      user: User.fromJson(json['user']),
    );
  }
}

class LoginRequest {
  final String email;
  final String password;

  LoginRequest({
    required this.email,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'password': password,
    };
  }
}

class RegisterRequest {
  final String email;
  final String username;
  final String password;

  RegisterRequest({
    required this.email,
    required this.username,
    required this.password,
  });

  Map<String, dynamic> toJson() {
    return {
      'email': email,
      'username': username,
      'password': password,
    };
  }
}

class UpdateProfileRequest {
  final String? username;
  final String? profilePicture;

  UpdateProfileRequest({
    this.username,
    this.profilePicture,
  });

  Map<String, dynamic> toJson() {
    final Map<String, dynamic> data = {};
    if (username != null) data['username'] = username;
    if (profilePicture != null) data['profilePicture'] = profilePicture;
    return data;
  }
}

class UpdatePasswordRequest {
  final String currentPassword;
  final String newPassword;

  UpdatePasswordRequest({
    required this.currentPassword,
    required this.newPassword,
  });

  Map<String, dynamic> toJson() {
    return {
      'currentPassword': currentPassword,
      'newPassword': newPassword,
    };
  }
}

class FavoritesResponse {
  final List<int> movies;
  final List<int> tvShows;

  FavoritesResponse({
    required this.movies,
    required this.tvShows,
  });

  factory FavoritesResponse.fromJson(Map<String, dynamic> json) {
    return FavoritesResponse(
      movies: json['movies'] != null ? List<int>.from(json['movies']) : [],
      tvShows: json['tvShows'] != null ? List<int>.from(json['tvShows']) : [],
    );
  }
}
