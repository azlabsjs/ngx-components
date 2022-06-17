import {
  Component,
  ContentChild,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';
import { Dropdown } from '../core';
import { DropdownToggleDirective } from './dropdown-toggle.directive';
import { DropdownMenuComponent } from './dropdown.menu.component';

@Component({
  selector: 'ngx-dropdown',
  template: `
    <ng-content select="[dropdownToggle]"></ng-content>
    <ng-content select="[ngx-dropdown-menu]"></ng-content>
  `,
  styles: [
    `
      :host ::ng-deep .dropdown-toggle,
      .dropdown-toggle {
        display: inline;
      }
    `,
  ],
})
export class DropdownComponent {
  @ContentChild(DropdownToggleDirective)
  dropdownToggleDirective!: DropdownToggleDirective;
  @ContentChild(DropdownMenuComponent) dropdownMenu!: Dropdown;
  @Output() closed = new EventEmitter<void>();

  @HostListener('document:click', ['$event.target']) documentClickListener(
    target: HTMLElement
  ) {
    if (
      !this.dropdownToggleDirective!.elementRef!.nativeElement.contains(target)
    ) {
      this.dropdownMenu!.closed.emit();
    }
  }
}
