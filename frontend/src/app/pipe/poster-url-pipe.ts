import { Pipe, PipeTransform } from '@angular/core';
import { TmdbService } from '../services/tmdb.service';

@Pipe({
  name: 'posterUrl',
  standalone: true
})
export class PosterUrlPipe implements PipeTransform {
  constructor(private tmdb: TmdbService) {}

  transform(path: string | null, size: string = 'w92'): string {
    return this.tmdb.getPosterUrl(path, size);
  }
}