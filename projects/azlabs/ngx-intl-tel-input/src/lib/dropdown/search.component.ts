import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { SetStateParam } from './types';

@Component({
  selector: 'ngx-dropdown-search',
  template: `
    <input
      (change)="onInputChange($event)"
      (input)="onInputChange($event)"
      (click)="onSearchClick($event)"
      [placeholder]="placeholder"
      class="ngx-dropdown-search"
    />
  `,
  styles: [
    `
      input.ngx-dropdown-search {
        padding: var(--ngx-dropdown-search-padding, 0.7rem 0.3rem);
        position: relative;
        width: var(--ngx-dropdown-search-width, 100%);
        margin: 0;
        border-radius: var(--ngx-dropdown-search-border-radius, 0);
        border-top: var(--ngx-dropdown-search-border-top-width, 0) solid
          var(--ngx-dropdown-search-border-top-color, transparent);
        border-left: var(--ngx-dropdown-search-border-left-width, 0) solid
          var(--ngx-dropdown-search-border-top-color, transparent);
        border-right: var(--ngx-dropdown-search-border-right-width, 0) solid
          var(--ngx-dropdown-search-border-top-color, transparent);
        border-bottom: var(--ngx-dropdown-search-border-bottom-width, 0.05rem)
          solid var(--ngx-dropdown-search-border-color, hsl(198deg, 10%, 46%));
        height: var(--ngx-dropdown-search-height, 1rem);
        color: var(--ngx-dropdown-search-color, hsl(198deg, 0%, 0%));
        box-shadow: none;
        display: inline-block;
        max-height: var(--ngx-dropdown-search-max-height, 1.2rem);
        font-size: var(--ngx-dropdown-search-max-height, 0.8rem);
        background: transparent;
        transition: border-color 200ms ease-in-out;
        outline: 0;
      }
      input.ngx-dropdown-search:focus {
        border-bottom-width: var(--ngx-dropdown-search-bottom-width, 2.5px);
        border-image: linear-gradient(
          to right,
          var(--ngx-dropdown-search-color, hsl(198deg, 100%, 32%)) 95%,
          var(--ngx-dropdown-search-color, hsl(198deg, 100%, 32%)) 95%
        );
        border-image-slice: 1;
      }

      input.ngx-dropdown-search:not([readonly]) {
        background: linear-gradient(
            to bottom,
            var(--text-input-color, hsl(198deg, 100%, 32%)) 95%,
            var(--text-input-color, hsl(198deg, 100%, 32%)) 95%
          )
          no-repeat;
        background-size: 0% 100%;
        transition: background-size 200ms ease-in-out;
      }
    `,
  ],
})
export class DropdownSearchComponent {
  // #region component outputs
  @Output() valueChange = new EventEmitter();
  // #region component outputs

  // #region component input
  @Input() placeholder: string = 'Search...';
  // #endregion component output

  private _state = {
    value: '',
    disabled: false,
  };

  /**
   * Creates component instances
   *
   */
  constructor(private changeRef: ChangeDetectorRef) {}

  onInputChange(event?: Event) {
    const value = (event?.target as HTMLInputElement).value.trim();
    // Case the value does not change we doe not fire any change event
    if (value === this._state.value) {
      return;
    }
    this.setState((state) => ({ ...state, value }));
    this.dispatchValueChange();
    event?.stopPropagation();
  }

  onSearchClick(event?: Event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    event?.stopPropagation();
  }

  setState(state: SetStateParam<typeof this._state>) {
    if (typeof state === 'function') {
      this._state = state(this._state);
    }
    this._state = { ...this._state, ...state };
    this.changeRef.markForCheck();
  }

  private dispatchValueChange() {
    this.valueChange.emit(this._state.value);
  }
}
