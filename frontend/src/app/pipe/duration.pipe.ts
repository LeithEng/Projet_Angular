import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
     name: 'duration', 
     standalone: true 
    })
    
export class DurationPipe implements PipeTransform {
  transform(minutes: number): string {
    if (!minutes) return '';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  }
}