import { Component, EventEmitter, Input, Output, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-youtube-player',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './youtube-player.component.html',
  styleUrl: './youtube-player.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class YoutubePlayerComponent {
  @Input() videoKey: string | null = null;
  @Input() videoTitle: string = 'Trailer';
  @Output() close = new EventEmitter<void>();

  videoUrl = signal<SafeResourceUrl | null>(null);

  constructor(private sanitizer: DomSanitizer) {
    effect(() => {
      if (this.videoKey) {
        const url = `https://www.youtube.com/embed/${this.videoKey}?autoplay=1&rel=0&modestbranding=1`;
        this.videoUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      } else {
        this.videoUrl.set(null);
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}
