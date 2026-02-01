import 'package:flutter/material.dart';
import '../config/app_theme.dart';

class SearchBarWidget extends StatelessWidget {
  final VoidCallback onTap;
  final String hintText;

  const SearchBarWidget({
    super.key,
    required this.onTap,
    this.hintText = 'Search movies, TV shows...',
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: AppTheme.surfaceColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: AppTheme.borderColor,
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.search,
              color: AppTheme.textTertiary,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                hintText,
                style: TextStyle(
                  color: AppTheme.textTertiary,
                  fontSize: 16,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
