import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CohortService } from '../../core/services/cohort.service';
import { ContentService } from '../../core/services/content.service';
import { Cohort } from '../../shared/models';
import { SeatMeter } from '../../shared/ui/seat-meter';

@Component({
  selector: 'app-cohorts',
  imports: [FormsModule, DatePipe, SeatMeter],
  templateUrl: './cohorts.html',
  styleUrl: './cohorts.scss',
})
export class Cohorts {
  readonly auth = inject(AuthService);
  private api = inject(CohortService);
  private content = inject(ContentService);

  readonly cohorts = this.api.cohorts;
  readonly programs = this.content.programs;

  programId = '';
  title = '';
  startDate = '';
  seatLimit = 30;
  status = signal<string | null>(null);
  pending = signal<string | null>(null);

  create() {
    if (!this.programId || this.title.trim().length < 3 || !this.startDate) {
      this.status.set('Pick a program, a title, and a start date.');
      return;
    }
    this.status.set('Opening cohort...');
    this.api
      .create({
        programId: this.programId,
        title: this.title.trim(),
        startDate: new Date(this.startDate).toISOString(),
        seatLimit: Number(this.seatLimit),
      })
      .subscribe({
        next: () => {
          this.title = '';
          this.startDate = '';
          this.status.set('Cohort opened.');
          this.cohorts.reload();
        },
        error: (e) => this.status.set(e?.error?.message ?? 'Could not open cohort.'),
      });
  }

  enroll(c: Cohort) {
    this.pending.set(c.id);
    this.status.set(null);
    this.api.enroll(c.id).subscribe({
      next: () => {
        this.pending.set(null);
        this.status.set(`Enrolled in ${c.title}.`);
        this.cohorts.reload();
      },
      error: (e) => {
        this.pending.set(null);
        this.status.set(e?.error?.message ?? 'Could not enroll.');
      },
    });
  }
}
