import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { computeCssClass, computeMenuClass } from './helpers';
import { Animation, Orientation } from './types';

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
  _state: StateType = {
    active: false,
    css: {
      dropdown: {} as Record<string, boolean>,
      menu: {} as Record<string, boolean>,
    },
  };
  get state() {
    return this._state;
  }

  @Input() orientation: Orientation = 'right';
  @Input() animation: Animation = 'scaleY';
  @Input() text!: string;
  @Input({ alias: 'class' }) cssClass!: string;
  @Input({ alias: 'no-hover' }) noHover: boolean = false;
  @Input() disabled: boolean = false;

  // #region component projected contents
  @ViewChild('dropdownHeader', { static: false })
  header!: ElementRef<HTMLElement>;
  @ViewChild('dropdownMenu', { static: false })
  menu!: ElementRef<HTMLElement>;
  @ContentChild('dropdownToggle') toggle!: TemplateRef<any>;
  // #endregion

  @HostListener('window:click', ['$event'])
  onClick(e: MouseEvent) {
    if (!(e.target as Element).classList.contains('dropdown-container') && this._state.active) {
      this.setState((state) => ({
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

  /** @description creates component instances */
  constructor(private cdRef: ChangeDetectorRef | null) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      'orientation' in changes ||
      'animation' in changes ||
      'noHover' in changes ||
      'active' in changes ||
      'disabled' in changes
    ) {
      this.setState((state) => ({
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
      this.setState((state) => ({
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

  /** @description update component state and notify ui of state changes */
  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
