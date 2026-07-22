import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthFacade } from '../../../../core/auth/auth.facade';
import { Role } from '../../../../shared/models';

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  private auth = inject(AuthFacade);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  mode = signal<'login' | 'register'>('login');
  error = signal<string | null>(null);
  loading = signal(false);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['learner' as Role],
  });

  toggle() {
    this.mode.set(this.mode() === 'login' ? 'register' : 'login');
    this.error.set(null);
  }

  submit() {
    if (this.form.invalid) {
      this.error.set('Enter a valid email and a password of at least 8 characters.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    const { email, password, role } = this.form.getRawValue();
    const request =
      this.mode() === 'login'
        ? this.auth.login(email, password)
        : this.auth.register(email, password, role);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.router.navigate(['/cohorts']),
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.message ?? 'Something went wrong. Try again.');
      },
    });
  }
}
