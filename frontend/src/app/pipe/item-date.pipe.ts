import { Pipe, PipeTransform } from '@angular/core';
import { Movie, TVShow } from '../models/tmdb.model';

@Pipe({
  name: 'itemDate',
  standalone: true
})
export class ItemDatePipe implements PipeTransform {
  transform(item: Movie | TVShow ): string {
    if (!item) return '';
    return (item as Movie).release_date || (item as TVShow).first_air_date || '';
  }
}
