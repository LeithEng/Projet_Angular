import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Movie, TVShow } from '../../models/tmdb.model';
import { SelectService } from '../../services/select-service';
import { ItemTitlePipe } from '../../pipe/item-title.pipe';
import { PosterUrlPipe } from '../../pipe/poster-url-pipe';
import { ItemDatePipe } from '../../pipe/item-date.pipe';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-card',
  imports: [CommonModule ,PosterUrlPipe, ItemTitlePipe, ItemDatePipe],
  templateUrl: './content-card.html',
  styleUrl: './content-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContentCardComponent {

  private selectContentService = inject(SelectService);
  
  item = input.required<Movie | TVShow>();
  isLarge = input<boolean>(false);

  onCardClick() {
    this.selectContentService.selectContent(this.item());
  }
}

