import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
    canActivate: [guestGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    canActivate: [authGuard],
    
  },

  {
    path: 'movie',
    loadComponent: () => import('./pages/movie/movie.component').then((m) => m.MovieComponent),
    canActivate: [authGuard],
    
  },
  {
    path: 'tv',
    loadComponent: () => import('./pages/tv-show/tv-show.component').then((m) => m.TvShowComponent),
    canActivate: [authGuard],
  },

  {
    path: 'movie/:id',
    loadComponent: () =>
      import('./pages/movie-detail/movie-detail.component').then((m) => m.MovieDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: 'tv/:id',
    loadComponent: () =>
      import('./pages/tv-detail/tv-detail.component').then((m) => m.TvDetailComponent),
    canActivate: [authGuard],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./pages/not-found/not-found').then((m) => m.NotFoundComponent),
  },
];
