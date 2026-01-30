import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TmdbService } from '../../services/tmdb.service';
import { User } from '../../models/auth.model';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';
import { passwordMatchValidator } from '../../validators/password-match.validator';
import { userNameValidator } from '../../validators/user-name.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private tmdbService = inject(TmdbService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  user = signal<User | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  favoriteMovies = signal<any[]>([]);
  favoriteTvShows = signal<any[]>([]);
  loadingFavorites = signal(false);
  profileForm: FormGroup;
  passwordForm: FormGroup;
  private originalUsername = '';

  constructor() {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      profilePicture: [''],
    });

    this.passwordForm = this.fb.group(
      {
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: passwordMatchValidator(),
      },
    );
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadFavorites();
  }

  loadProfile(): void {
    this.loading.set(true);
    this.authService.getProfile().subscribe({
      next: (userData) => {
        this.user.set(userData);
        this.originalUsername = userData.username;
        this.profileForm.patchValue({
          username: userData.username,
          profilePicture: userData.profilePicture || '',
        });
        // Set async validator only after we have the original username
        this.profileForm
          .get('username')
          ?.setAsyncValidators([userNameValidator(this.authService, this.originalUsername)]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load profile');
        this.loading.set(false);
      },
    });
  }

  loadFavorites(): void {
    this.loadingFavorites.set(true);
    this.authService.getFavorites().subscribe({
      next: (favorites) => {
        favorites.movies.forEach((id) => {
          this.tmdbService.getMovieDetails(id).subscribe({
            next: (movie) => {
              this.favoriteMovies.update((movies) => [...movies, movie]);
            },
          });
        });
        favorites.tvShows.forEach((id) => {
          this.tmdbService.getTVShowDetails(id).subscribe({
            next: (show) => {
              this.favoriteTvShows.update((shows) => [...shows, show]);
            },
          });
        });

        this.loadingFavorites.set(false);
      },
      error: () => {
        this.loadingFavorites.set(false);
      },
    });
  }

  get username() {
    return this.profileForm.get('username');
  }

  get currentPassword() {
    return this.passwordForm.get('currentPassword');
  }

  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Check file size
      const maxSize = 3 * 1024 * 1024; // 3MB in bytes
      if (file.size > maxSize) {
        this.error.set('Image size must be less than 3MB. Please choose a smaller image.');
        setTimeout(() => this.error.set(null), 5000);
        input.value = '';
        return;
      }

      // Check file type
      if (!file.type.match(/image\/(jpg|jpeg|png|gif)/)) {
        this.error.set('Please select a valid image file (JPG, PNG, or GIF).');
        setTimeout(() => this.error.set(null), 5000);
        input.value = '';
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        this.profileForm.patchValue({ profilePicture: imageUrl });
      };

      reader.readAsDataURL(file);
    }
  }

  onSubmitProfile(): void {
    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach((key) => {
        this.profileForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: (userData) => {
        this.user.set(userData);
        this.success.set('Profile updated successfully!');
        this.loading.set(false);
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        let errorMessage = 'Failed to update profile';
        if (err.error?.message) {
          if (Array.isArray(err.error.message)) {
            errorMessage = err.error.message[0];
          } else {
            errorMessage = err.error.message;
          }
        } else if (err.status === 413) {
          errorMessage = 'Image size is too large. Please choose a smaller image (max 3MB).';
        }
        this.error.set(errorMessage);
        this.loading.set(false);
        setTimeout(() => this.error.set(null), 5000);
      },
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      Object.keys(this.passwordForm.controls).forEach((key) => {
        this.passwordForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.authService.updatePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.success.set('Password updated successfully!');
        this.loading.set(false);
        this.passwordForm.reset();
        setTimeout(() => this.success.set(null), 3000);
      },
      error: (err) => {
        let errorMessage = 'Failed to update password';
        if (err.error?.message) {
          if (Array.isArray(err.error.message)) {
            errorMessage = err.error.message[0];
          } else {
            errorMessage = err.error.message;
          }
        }
        this.error.set(errorMessage);
        this.loading.set(false);
        setTimeout(() => this.error.set(null), 5000);
      },
    });
  }

  navigateToContent(item: any, type: 'movie' | 'tv'): void {
    if (type === 'movie') {
      this.router.navigate(['/movie', item.id]);
    } else {
      this.router.navigate(['/tv', item.id]);
    }
  }

  removeFavorite(contentId: number, type: 'movie' | 'tv'): void {
    this.authService.toggleFavorite(contentId, type).subscribe({
      next: () => {
        if (type === 'movie') {
          this.favoriteMovies.update((movies) => movies.filter((m) => m.id !== contentId));
        } else {
          this.favoriteTvShows.update((shows) => shows.filter((s) => s.id !== contentId));
        }
        this.success.set('Removed from favorites');
        setTimeout(() => this.success.set(null), 2000);
      },
      error: () => {
        this.error.set('Failed to remove from favorites');
      },
    });
  }
}
