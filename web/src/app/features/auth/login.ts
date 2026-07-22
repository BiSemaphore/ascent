import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/services/auth';
import { Role } from '../../shared/models';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  mode = signal<'login' | 'register'>('login');
  email = '';
  password = '';
  role: Role = 'learner';
  error = signal<string | null>(null);
  loading = signal(false);

  toggle() {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set(null);
  }

  submit() {
    this.loading.set(true);
    this.error.set(null);
    const request =
      this.mode() === 'login'
        ? this.auth.login(this.email, this.password)
        : this.auth.register(this.email, this.password, this.role);
    request.subscribe({
      next: () => this.router.navigate(['/cohorts']),
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Something went wrong. Try again.');
      },
    });
  }
}
