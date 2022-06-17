import {
  Component,
  EventEmitter,
  Input,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Dropdown } from '../core';

@Component({
  selector: 'ngx-dropdown-menu',
  template: ` <ng-template
    ><div class="ngx-dropdown-content">
      <ng-content></ng-content></div
  ></ng-template>`,
  styles: [
    `
      .ngx-dropdown-content {
        width: 250px;
        border-radius: 0.15rem;
        text-align: center;
        max-height: 300px;
        display: flex;
        flex-direction: column;
        min-width: 6rem;
        max-width: 18rem;
        background: var(--clr-dropdown-bg-color, #fff);
        border-radius: var(--clr-global-borderradius, 0.15rem);
        box-shadow: 0 0.05rem 0.15rem var(--clr-dropdown-box-shadow, #8c8c8c40);
        margin-top: 0.1rem;
        padding: 0.6rem 0;
      }
    `,
  ],
})
export class DropdownMenuComponent implements Dropdown {
  //
  @Input() position!: string;
  @ViewChild(TemplateRef) templateRef!: TemplateRef<any>;
  @Output() closed = new EventEmitter<void>();
}
