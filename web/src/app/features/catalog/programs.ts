import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/services/auth';
import { Content } from '../../core/services/content';

@Component({
  selector: 'app-programs',
  imports: [FormsModule],
  templateUrl: './programs.html',
  styleUrl: './programs.scss',
})
export class Programs {
  readonly auth = inject(Auth);
  private content = inject(Content);

  readonly programs = this.content.programs;
  newTitle = '';
  newCourse = '';
  status = signal<string | null>(null);

  create() {
    const title = this.newTitle.trim();
    if (title.length < 3) {
      this.status.set('Give the program a title (3+ characters).');
      return;
    }
    this.status.set('Publishing...');
    this.content.publishNewProgram(title, this.newCourse.trim() || undefined).subscribe({
      next: () => {
        this.newTitle = '';
        this.newCourse = '';
        this.status.set('Program published.');
        this.programs.reload();
      },
      error: (e) => this.status.set(e?.error?.message ?? 'Could not publish.'),
    });
  }
}
