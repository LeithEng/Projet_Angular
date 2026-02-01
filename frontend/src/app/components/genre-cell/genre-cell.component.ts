import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Genre } from '../../models/tmdb.model'; 
import { ContentType } from '../../types/content-type.type';
import { Router, RouterModule } from '@angular/router';
import { ROUTES } from '../../constants/route.const';

@Component({
  selector: 'app-genre-cell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './genre-cell.component.html',
  styleUrl: './genre-cell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenreCellComponent {
    private router = inject(Router);
    private readonly routes = ROUTES;
    genre = input.required<Genre>();
    contentType = input.required<ContentType>();

    onclick() {
        this.router.navigate(['/',this.routes.GENRE, this.contentType(), this.genre().id], { queryParams: { name: this.genre().name } });    
    }
}
