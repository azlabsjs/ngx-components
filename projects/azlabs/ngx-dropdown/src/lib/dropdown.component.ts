import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ContentChild, ElementRef, HostListener, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild, signal as createSignal } from '@angular/core';
import { computeCssClass, computeMenuClass } from './helpers';
import { Animation, Optional, Orientation } from './types';

// @internal
type StateType = {
  active: boolean;
  css: {
    dropdown: Record<string, boolean>;
    menu: Record<string, boolean>;
  };
};

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ngx-azl-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownComponent implements OnChanges {
  protected signal = createSignal<StateType>({
    active: false,
    css: {
      dropdown: {} as Record<string, boolean>,
      menu: {} as Record<string, boolean>,
    },
  });

  @Input() orientation: Orientation = 'right';
  @Input() animation: Animation = 'scaleY';
  @Input() text!: string;
  @Input({ alias: 'class' }) cssClass!: string;
  @Input({ alias: 'no-hover' }) noHover: boolean = false;
  @Input() disabled: boolean = false;

  @ViewChild('dropdownHeader', { static: false }) header!: ElementRef<HTMLElement>;
  @ViewChild('dropdownMenu', { static: false }) menu!: ElementRef<HTMLElement>;
  @ContentChild('dropdownToggle') toggle!: Optional<TemplateRef<any>>;

  @HostListener('window:click', ['$event'])
  onClick(e: MouseEvent) {
    const { active } = this.signal();
    if (!(e.target as Element).classList.contains('dropdown-container') && active) {
      this.signal.update((state) => ({
        ...state,
        active: false,
        css: {
          menu: computeMenuClass(this.orientation, this.animation),
          dropdown: computeCssClass(
            this.cssClass,
            this.noHover,
            !state.active,
            this.disabled
          ),
        },
      }));
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'orientation' in changes ||
      'animation' in changes ||
      'noHover' in changes ||
      'active' in changes ||
      'disabled' in changes
    ) {
      this.signal.update((state) => ({
        ...state,
        css: {
          menu: computeMenuClass(this.orientation, this.animation),
          dropdown: computeCssClass(
            this.cssClass,
            this.noHover,
            state.active,
            this.disabled
          ),
        },
      }));
    }
  }

  onToggleDropdown(e: Event) {
    if (this.noHover && !this.disabled) {
      this.signal.update((state) => ({
        ...state,
        active: !state.active,
        css: {
          menu: computeMenuClass(this.orientation, this.animation),
          dropdown: computeCssClass(
            this.cssClass,
            this.noHover,
            !state.active,
            this.disabled
          ),
        },
      }));
    }
    e.preventDefault();
    e.stopPropagation();
  }
}
