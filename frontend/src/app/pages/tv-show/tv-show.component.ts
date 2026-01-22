import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { TVShow } from '../../models/tmdb.model';
import { HeroBannerComponent } from "../../components/hero-banner/hero-banner";
import { MovieRowComponent } from '../../components/movie-row/movie-row';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { FETCH_TYPE } from '../../constants/fetch-type.const';

@Component({
  selector: 'app-tv-show',
  standalone: true,
  imports: [CommonModule, HeroBannerComponent, MovieRowComponent, NavbarComponent],
  templateUrl: './tv-show.component.html',
  styleUrl: "./tv-show.component.css"
})
export class TvShowComponent implements OnInit {
  bannerTvShow = signal<TVShow | null>(null);
  protected readonly fetchTypes = FETCH_TYPE;

  private tmdbService: TmdbService = inject(TmdbService);

  ngOnInit() {
    this.tmdbService.getTrendingTVShows().subscribe(response => {
      if (response.results && response.results.length > 0) {
        const randomIndex = Math.floor(Math.random() * response.results.length);
        this.bannerTvShow.set(response.results[randomIndex]);
      }
    });
  }
}
