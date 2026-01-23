import { Pipe, PipeTransform } from '@angular/core';
import { Movie, TVShow } from '../models/tmdb.model';

@Pipe({
  name: 'itemTitle',
  standalone: true
})
export class ItemTitlePipe implements PipeTransform {
  transform(item: Movie | TVShow ): string {
    if (!item) return '';
    return (item as Movie).title || (item as TVShow).name || '';
  }
}
