import 'package:flutter/material.dart';
import 'dart:async';
import '../../config/app_theme.dart';
import '../../services/tmdb_service.dart';
import '../../models/tmdb_models.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({super.key});

  @override
  State<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends State<SearchPage> {
  final TextEditingController _searchController = TextEditingController();
  final TmdbService _tmdbService = TmdbService();
  final FocusNode _focusNode = FocusNode();

  List<SearchResult> _searchResults = [];
  bool _isLoading = false;
  bool _hasSearched = false;
  String _errorMessage = '';
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    // Auto-focus the search field when page opens
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    _debounce?.cancel();
    super.dispose();
  }

  void _onSearchChanged(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();

    if (query.isEmpty) {
      setState(() {
        _searchResults = [];
        _hasSearched = false;
        _errorMessage = '';
      });
      return;
    }

    _debounce = Timer(const Duration(milliseconds: 500), () {
      _performSearch(query);
    });
  }

  Future<void> _performSearch(String query) async {
    if (query.trim().isEmpty) return;

    setState(() {
      _isLoading = true;
      _errorMessage = '';
      _hasSearched = true;
    });

    try {
      final response = await _tmdbService.searchMulti(query);
      setState(() {
        _searchResults = response.results
            .where((result) =>
                result.mediaType == 'movie' || result.mediaType == 'tv')
            .toList();
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _errorMessage = 'Error searching: ${e.toString()}';
        _isLoading = false;
        _searchResults = [];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        backgroundColor: AppTheme.backgroundColor,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppTheme.textPrimary),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: TextField(
          controller: _searchController,
          focusNode: _focusNode,
          style: const TextStyle(color: AppTheme.textPrimary, fontSize: 16),
          decoration: InputDecoration(
            hintText: 'Search movies, TV shows...',
            hintStyle: const TextStyle(color: AppTheme.textTertiary),
            border: InputBorder.none,
            suffixIcon: _searchController.text.isNotEmpty
                ? IconButton(
                    icon: const Icon(Icons.clear, color: AppTheme.textTertiary),
                    onPressed: () {
                      _searchController.clear();
                      setState(() {
                        _searchResults = [];
                        _hasSearched = false;
                        _errorMessage = '';
                      });
                    },
                  )
                : null,
          ),
          onChanged: _onSearchChanged,
          onSubmitted: _performSearch,
        ),
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isLoading) {
      return const Center(
        child: CircularProgressIndicator(
          color: AppTheme.primaryColor,
        ),
      );
    }

    if (_errorMessage.isNotEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline,
                size: 64,
                color: AppTheme.errorColor,
              ),
              const SizedBox(height: 16),
              Text(
                _errorMessage,
                style: const TextStyle(
                  color: AppTheme.textSecondary,
                  fontSize: 16,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => _performSearch(_searchController.text),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      );
    }

    if (!_hasSearched) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.search,
              size: 80,
              color: AppTheme.textTertiary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'Search for movies and TV shows',
              style: TextStyle(
                color: AppTheme.textTertiary,
                fontSize: 16,
              ),
            ),
          ],
        ),
      );
    }

    if (_searchResults.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.movie_outlined,
              size: 80,
              color: AppTheme.textTertiary.withOpacity(0.5),
            ),
            const SizedBox(height: 16),
            Text(
              'No results found',
              style: TextStyle(
                color: AppTheme.textSecondary,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Try searching with different keywords',
              style: TextStyle(
                color: AppTheme.textTertiary,
                fontSize: 14,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _searchResults.length,
      itemBuilder: (context, index) {
        final result = _searchResults[index];
        return _SearchResultCard(
          result: result,
          tmdbService: _tmdbService,
        );
      },
    );
  }
}

class _SearchResultCard extends StatelessWidget {
  final SearchResult result;
  final TmdbService tmdbService;

  const _SearchResultCard({
    required this.result,
    required this.tmdbService,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      color: AppTheme.cardColor,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: AppTheme.borderColor, width: 1),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () {
          // TODO: Navigate to detail page
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Selected: ${result.title}'),
              backgroundColor: AppTheme.primaryColor,
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Poster Image
              ClipRRect(
                borderRadius: BorderRadius.circular(8),
                child: result.posterPath != null
                    ? Image.network(
                        tmdbService.getPosterUrl(result.posterPath,
                            size: 'w185'),
                        width: 80,
                        height: 120,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return _buildPlaceholderImage();
                        },
                      )
                    : _buildPlaceholderImage(),
              ),
              const SizedBox(width: 12),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Title
                    Text(
                      result.title,
                      style: const TextStyle(
                        color: AppTheme.textPrimary,
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    // Media Type & Release Date
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppTheme.primaryColor.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            result.mediaType.toUpperCase(),
                            style: const TextStyle(
                              color: AppTheme.primaryColor,
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                        if (result.releaseDate != null) ...[
                          const SizedBox(width: 8),
                          Text(
                            _formatYear(result.releaseDate!),
                            style: const TextStyle(
                              color: AppTheme.textTertiary,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ],
                    ),
                    const SizedBox(height: 8),
                    // Rating
                    Row(
                      children: [
                        const Icon(
                          Icons.star,
                          color: Colors.amber,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          result.voteAverage.toStringAsFixed(1),
                          style: const TextStyle(
                            color: AppTheme.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '(${result.voteCount})',
                          style: const TextStyle(
                            color: AppTheme.textTertiary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    if (result.overview != null &&
                        result.overview!.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text(
                        result.overview!,
                        style: const TextStyle(
                          color: AppTheme.textTertiary,
                          fontSize: 13,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      width: 80,
      height: 120,
      color: AppTheme.surfaceColor,
      child: const Icon(
        Icons.movie_outlined,
        color: AppTheme.textTertiary,
        size: 40,
      ),
    );
  }

  String _formatYear(String date) {
    try {
      return date.split('-')[0];
    } catch (e) {
      return '';
    }
  }
}
