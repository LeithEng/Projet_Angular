import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../../components/search-bar/search-bar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, SearchBarComponent],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NavbarComponent {
  private authService = inject(AuthService);

  isScrolled = signal(false);
  isMenuOpen = signal(false);

  constructor() {
    fromEvent(window, 'scroll')
      .pipe(takeUntilDestroyed())
      .subscribe(() => {
        this.isScrolled.set(window.scrollY > 50);
      });
  }

  toggleMenu() {
    this.isMenuOpen.update((value) => !value);
  }

  onLogout() {
    this.authService.logout();
  }
}
