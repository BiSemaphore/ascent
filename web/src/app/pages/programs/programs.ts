import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { Auth } from '../../core/auth';
import { Content } from '../../core/content';
import { Program } from '../../core/models';

@Component({
  selector: 'app-programs',
  imports: [FormsModule],
  templateUrl: './programs.html',
})
export class Programs implements OnInit {
  private content = inject(Content);
  readonly auth = inject(Auth);

  programs = signal<Program[]>([]);
  status = signal<string | null>(null);
  newTitle = '';
  newCourse = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.content.listPrograms().subscribe({
      next: (p) => this.programs.set(p),
      error: () => this.status.set('Failed to load programs'),
    });
  }

  create() {
    const title = this.newTitle.trim();
    if (!title) {
      return;
    }
    const course = this.newCourse.trim();
    this.status.set('Creating...');

    this.content
      .createProgram(title)
      .pipe(
        switchMap((program) => {
          const courseStep: Observable<unknown> = course
            ? this.content
                .createCourse(program.id, course)
                .pipe(switchMap((c) => this.content.publishCourse(c.id)))
            : of(null);
          return courseStep.pipe(
            switchMap(() => this.content.publishProgram(program.id)),
          );
        }),
      )
      .subscribe({
        next: () => {
          this.newTitle = '';
          this.newCourse = '';
          this.status.set('Created and published');
          this.load();
        },
        error: (e) => this.status.set(e?.error?.message ?? 'Failed to create'),
      });
  }
}
