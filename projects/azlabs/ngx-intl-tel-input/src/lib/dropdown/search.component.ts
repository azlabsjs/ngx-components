import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { SetStateParam } from './types';

type StateType = {
  value: string;
  disabled: boolean;
};

@Component({
  selector: 'ngx-azl-dropdown-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class DropdownSearchComponent {
  // #region component outputs
  @Output() valueChange = new EventEmitter();
  // #region component outputs

  // #region component input
  @Input() placeholder: string = 'Search...';
  // #endregion component output

  private _state: StateType = {
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

  setState(state: SetStateParam<StateType>) {
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
