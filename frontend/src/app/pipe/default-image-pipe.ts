import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
    name: 'defaultImage',
    standalone: true,
})
export class DefaultImagePipe implements PipeTransform {
  transform(path: string): string {
    if (!path.trim()) return '/assets/no-avatar.png';
    return path;
  }
}