import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CatalogFacade } from '../../catalog.facade';
import { HasRoleDirective } from '../../../../shared/directives/has-role.directive';

@Component({
  selector: 'app-programs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, HasRoleDirective],
  templateUrl: './programs.html',
  styleUrl: './programs.scss',
})
export class Programs {
  private facade = inject(CatalogFacade);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly programs = this.facade.programs;
  readonly status = this.facade.status;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    course: [''],
  });

  create() {
    if (this.form.invalid) {
      this.status.set('Give the program a title (3+ characters).');
      return;
    }
    const { title, course } = this.form.getRawValue();
    this.facade
      .publishNewProgram(title.trim(), course.trim() || undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.form.reset());
  }
}
