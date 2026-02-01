import { Pipe, PipeTransform, inject } from '@angular/core';
import { TmdbService } from '../services/tmdb.service';

@Pipe({
  name: 'tmdbImage',
  standalone: true
})
export class TmdbImagePipe implements PipeTransform {
  private tmdb = inject(TmdbService);

  transform(path: string | null | undefined, type: 'poster' | 'backdrop' | 'profile' = 'poster'): string {
    if (!path) {
      // Retourner une image par défaut selon le type
      if (type === 'backdrop') {
        return '/assets/no-image.png';
      }
      return '/assets/no-avatar.png'; 
    }

    if (path.startsWith('data:image') || path.startsWith('http')) {
      return path;
    }

    switch (type) {
      case 'backdrop':
        return this.tmdb.getBackdropUrl(path);
      case 'profile':
        return this.tmdb.getProfileUrl(path);
      default:
        return this.tmdb.getPosterUrl(path);
    }
  }
}