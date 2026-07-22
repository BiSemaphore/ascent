import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'ui-seat-meter',
  template: `
    <div class="meter">
      <div class="row">
        <span class="count">
          <span class="taken">{{ pad(taken()) }}</span
          ><span class="sep">/</span
          ><span class="limit">{{ pad(limit()) }}</span>
        </span>
        <span class="label" [class.is-full]="full()">
          {{ full() ? 'full' : remaining() + ' seats left' }}
        </span>
      </div>
      <div class="track">
        <div class="fill" [class.is-full]="full()" [style.width.%]="pct()"></div>
      </div>
    </div>
  `,
  styles: [
    `
      .meter {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 0.75rem;
      }
      .count {
        font-family: var(--font-mono);
        font-size: 1.05rem;
        letter-spacing: 0.02em;
        color: var(--ink);
      }
      .sep {
        color: var(--muted);
        margin: 0 0.15rem;
      }
      .limit {
        color: var(--muted);
      }
      .label {
        font-family: var(--font-mono);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.66rem;
        color: var(--accent-ink);
      }
      .label.is-full {
        color: var(--danger);
      }
      .track {
        height: 3px;
        background: var(--line);
        border-radius: 999px;
        overflow: hidden;
      }
      .fill {
        height: 100%;
        background: var(--accent);
        border-radius: 999px;
        transition: width 0.3s ease;
      }
      .fill.is-full {
        background: var(--danger);
      }
    `,
  ],
})
export class SeatMeter {
  taken = input.required<number>();
  limit = input.required<number>();

  remaining = computed(() => Math.max(0, this.limit() - this.taken()));
  full = computed(() => this.taken() >= this.limit());
  pct = computed(() =>
    this.limit() ? Math.min(100, (this.taken() / this.limit()) * 100) : 0,
  );

  pad(n: number) {
    return String(n).padStart(2, '0');
  }
}
