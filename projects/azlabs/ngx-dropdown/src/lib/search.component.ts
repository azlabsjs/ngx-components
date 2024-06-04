import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** @internal */
type StateType = {
  value: string;
  disabled: boolean;
};

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'ngx-azl-dropdown-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  get state() {
    return this._state;
  }

  /** @description Search component class constructor */
  constructor(private cdRef: ChangeDetectorRef|null) {}

  onInputChange(event?: Event) {
    const { value: v } = this._state;
    const value = (event?.target as HTMLInputElement).value.trim();
    // Case the value does not change we doe not fire any change event
    if (v === value) {
      return;
    }
    this.setState((state) => ({ ...state, value }));
    this.dispatchValueChange();
    event?.stopPropagation();
  }

  onSearchClick(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
  }

  private dispatchValueChange() {
    const { value } = this._state;
    this.valueChange.emit(value);
  }

  /** @description update component state and notify ui of state changes */
  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
