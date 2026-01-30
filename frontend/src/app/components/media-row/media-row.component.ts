import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Movie, TVShow } from '../../models/tmdb.model';
import { ContentCardComponent } from '../content-card/content-card';
import { SelectService } from '../../services/select-service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { CONTENT_TYPE } from '../../constants/content-type.const';

@Component({
  selector: 'app-media-row',
  standalone: true,
  imports: [CommonModule, ContentCardComponent],
  templateUrl: './media-row.component.html',
  styleUrl: './media-row.component.css'
})
export class MediaRowComponent {
    
    private selectService = inject(SelectService);
    private router = inject(Router);

    items = input.required<(Movie | TVShow)[]>();

    public contentType = input.required<string>();

    constructor(){
        this.selectService.selectContent$
            .pipe(takeUntilDestroyed())
            .subscribe((item) => {
                this.navigateToDetail(item);
            }
        );
    }

    navigateToDetail(item: Movie | TVShow): void {
        this.router.navigate([this.contentType() === CONTENT_TYPE.MOVIE ? '/movie' : '/tv', item.id]);
    }




}
