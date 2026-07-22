import {
  Directive,
  TemplateRef,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { AuthFacade } from '../../core/auth/auth.facade';
import { Role } from '../models';

@Directive({ selector: '[appHasRole]' })
export class HasRoleDirective {
  private tpl = inject(TemplateRef<unknown>);
  private vcr = inject(ViewContainerRef);
  private auth = inject(AuthFacade);

  readonly appHasRole = input.required<Role[]>();

  constructor() {
    effect(() => {
      const allowed = this.auth.hasRole(...this.appHasRole());
      this.vcr.clear();
      if (allowed) {
        this.vcr.createEmbeddedView(this.tpl);
      }
    });
  }
}
