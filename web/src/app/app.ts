import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';

type Theme = 'light' | 'dark';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly auth = inject(AuthService);
  private router = inject(Router);
  theme = signal<Theme>(this.initTheme());

  toggleTheme() {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    localStorage.setItem('theme', next);
    document.documentElement.setAttribute('data-theme', next);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  private initTheme(): Theme {
    const saved = localStorage.getItem('theme');
    const system = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
    const theme: Theme = saved === 'light' || saved === 'dark' ? saved : system;
    document.documentElement.setAttribute('data-theme', theme);
    return theme;
  }
}
