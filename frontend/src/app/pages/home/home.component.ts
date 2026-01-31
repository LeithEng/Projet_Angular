import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { GenreColumnComponent } from '../../components/genre-column/genre-column.component';
import { TmdbService } from '../../services/tmdb.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { CONTENT_TYPE } from '../../constants/content-type.const';
import { ROUTES } from '../../constants/route.const';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NavbarComponent, GenreColumnComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  
  user: Signal<User | null>;

  protected readonly contentTypes = CONTENT_TYPE;


  private router = inject(Router);
  private authService = inject(AuthService);
  private tmdbService = inject(TmdbService);

  constructor() {
    this.user = this.authService.currentUserSignal;
  }
  

  // Fetch genres
  movieGenres = toSignal(
    this.tmdbService.getMovieGenres().pipe(map(response => response.genres)), 
    { initialValue: [] }
  );
  
  tvGenres = toSignal(
    this.tmdbService.getTVGenres().pipe(map(response => response.genres)), 
    { initialValue: [] }
  );


 

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/',ROUTES.LOGIN]);
  }
}