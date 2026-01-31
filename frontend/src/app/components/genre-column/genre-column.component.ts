import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenreCellComponent } from '../genre-cell/genre-cell.component';
import { Genre } from '../../models/tmdb.model';
import { CONTENT_TYPE } from '../../constants/content-type.const';
import { Router } from '@angular/router';
import { ROUTES } from '../../constants/route.const';
import { ContentType } from '../../types/content-type.type';

@Component({
  selector: 'app-genre-column',
  standalone: true,
  imports: [CommonModule, GenreCellComponent],
  templateUrl: './genre-column.component.html',
  styleUrl: './genre-column.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreColumnComponent {
    
    private router = inject(Router);

    protected readonly contentTypes = CONTENT_TYPE;
    private readonly routes = ROUTES;

    title = input.required<string>(); 
    genres = input.required<Genre[]>();
    contentType = input.required<ContentType>(); 

    onclick() {
        if (this.title() === this.contentTypes.MOVIE) {
            this.router.navigate(['/',this.routes.MOVIE]);
        } else if (this.title() === this.contentTypes.TV) {
            this.router.navigate(['/',this.routes.TV]);
        }
    }
            



}
