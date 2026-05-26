import { Component, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { EMPTY, catchError, filter, throttleTime } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'vehicle-parking-system';
  private authService = inject(AuthService);
  private router = inject(Router);

  ngOnInit(): void {
    this.refreshUserSilently();
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        throttleTime(30_000)
      )
      .subscribe(() => this.refreshUserSilently());
  }

  private refreshUserSilently(): void {
    if (this.authService.isLoggedIn) {
      this.authService
        .refreshCurrentUser()
        .pipe(catchError(() => EMPTY))
        .subscribe();
    }
  }
}
