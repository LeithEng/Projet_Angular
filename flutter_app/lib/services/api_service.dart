import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/auth_model.dart';

class ApiService {
  late final Dio _dio;
  SharedPreferences? _prefs;

  ApiService() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Add interceptor for auth token
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await getToken();
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) {
          if (error.response?.statusCode == 401) {
            // Token expired or invalid - clear auth data
            clearAuthData();
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<SharedPreferences> get prefs async {
    _prefs ??= await SharedPreferences.getInstance();
    return _prefs!;
  }

  Future<String?> getToken() async {
    final p = await prefs;
    return p.getString(AppConfig.tokenKey);
  }

  Future<void> saveToken(String token) async {
    final p = await prefs;
    await p.setString(AppConfig.tokenKey, token);
  }

  Future<User?> getCurrentUser() async {
    final p = await prefs;
    final userJson = p.getString(AppConfig.userKey);
    if (userJson != null) {
      return User.fromJson(json.decode(userJson));
    }
    return null;
  }

  Future<void> saveUser(User user) async {
    final p = await prefs;
    await p.setString(AppConfig.userKey, json.encode(user.toJson()));
  }

  Future<void> clearAuthData() async {
    final p = await prefs;
    await p.remove(AppConfig.tokenKey);
    await p.remove(AppConfig.userKey);
  }

  Future<bool> isAuthenticated() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // Auth endpoints
  Future<AuthResponse> register(RegisterRequest request) async {
    try {
      final response = await _dio.post(
        '/auth/register',
        data: request.toJson(),
      );
      final authResponse = AuthResponse.fromJson(response.data);
      await saveToken(authResponse.accessToken);
      await saveUser(authResponse.user);
      return authResponse;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<AuthResponse> login(LoginRequest request) async {
    try {
      final response = await _dio.post(
        '/auth/login',
        data: request.toJson(),
      );
      final authResponse = AuthResponse.fromJson(response.data);
      await saveToken(authResponse.accessToken);
      await saveUser(authResponse.user);
      return authResponse;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> logout() async {
    await clearAuthData();
  }

  // User endpoints
  Future<User> getProfile() async {
    try {
      final response = await _dio.get('/users/profile');
      final user = User.fromJson(response.data);
      await saveUser(user);
      return user;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> updateProfile(UpdateProfileRequest request) async {
    try {
      final response = await _dio.put(
        '/users/profile',
        data: request.toJson(),
      );
      final user = User.fromJson(response.data);
      await saveUser(user);
      return user;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> updatePassword(UpdatePasswordRequest request) async {
    try {
      await _dio.put(
        '/users/password',
        data: request.toJson(),
      );
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<FavoritesResponse> getFavorites() async {
    try {
      final response = await _dio.get('/users/favorites');
      return FavoritesResponse.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<void> toggleFavorite(int contentId, String type) async {
    try {
      await _dio.post('/users/favorites', data: {
        'contentId': contentId,
        'type': type,
      });
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<bool> checkUsernameAvailability(String username) async {
    try {
      final response = await _dio.get(
        '/auth/check-username',
        queryParameters: {'username': username},
      );
      return response.data['available'] ?? false;
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  String _handleError(DioException error) {
    if (error.response?.data != null) {
      final data = error.response!.data;
      if (data is Map<String, dynamic>) {
        if (data['message'] is List) {
          return (data['message'] as List).first.toString();
        } else if (data['message'] is String) {
          return data['message'];
        }
      }
    }

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        return 'Connection timeout. Please try again.';
      case DioExceptionType.connectionError:
        return 'No internet connection. Please check your network.';
      default:
        return error.message ?? 'An unexpected error occurred.';
    }
  }
}
