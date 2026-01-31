import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbImagePipe } from  '../../pipe/tmdb-image.pipe';

@Component({
  selector: 'app-media-carousel',
  standalone: true,
  imports: [CommonModule, TmdbImagePipe],
  templateUrl: './media-carousel.component.html',
  styleUrls: ['./media-carousel.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaCarouselComponent {
  @Input({ required: true }) title: string = '';
  @Input({ required: true }) items: any[] = [];
  @Input() imageType: 'poster' | 'profile' = 'poster';
  @Output() itemClicked = new EventEmitter<any>();
}