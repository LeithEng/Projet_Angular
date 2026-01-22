import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TmdbService } from '../../services/tmdb.service';
import { Movie } from '../../models/tmdb.model';
import { HeroBannerComponent } from "../../components/hero-banner/hero-banner";
import { MovieRowComponent } from '../../components/movie-row/movie-row';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { FETCH_TYPE } from '../../constants/fetch-type.const';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroBannerComponent, MovieRowComponent ,NavbarComponent ],
  templateUrl: './movie.component.html',
  styleUrl: "./movie.component.css" 
})
export class MovieComponent implements OnInit {
  bannerMovie: Movie | null = null;
  protected readonly fetchTypes = FETCH_TYPE;

  constructor() {}

  private tmdbService: TmdbService = inject(TmdbService);

  ngOnInit() {
    // Fetch Trending movies to pick one for the banner
    this.tmdbService.getTrendingMovies().subscribe(response => {
      if (response.results && response.results.length > 0) {
        // Pick a random movie from the top 20
        const randomIndex = Math.floor(Math.random() * response.results.length);
        this.bannerMovie = response.results[randomIndex];
      }
    });
  }
}