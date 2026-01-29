import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { Movie } from '../../models/tmdb.model';
import { HeroBannerComponent } from "../../components/hero-banner/hero-banner";
import { ContentRowComponent } from '../../components/content-row/content-row';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { FETCH_TYPE } from '../../constants/fetch-type.const';
import { map, switchMap, timer } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroBannerComponent, ContentRowComponent, NavbarComponent],
  templateUrl: './movie.component.html',
  styleUrl: "./movie.component.css",
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MovieComponent {
  // Expose FETCH_TYPE to the template
  protected readonly fetchTypes = FETCH_TYPE;
  constructor() { }
  private tmdbService: TmdbService = inject(TmdbService);

  bannerMovie$ = this.tmdbService.getTrendingMovies().pipe(
    map(response => response.results), 
    map(movies => movies[Math.floor(Math.random() * movies.length)])
  )
  bannerMovie = toSignal(this.bannerMovie$, { initialValue: null });
}