import { Component, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/auth.model';
import { NavbarComponent } from '../../shared-componants/navbar/navbar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule , NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  user: Signal<User | null>;

  constructor(private authService: AuthService, private router: Router) {
    this.user = this.authService.currentUserSignal;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}