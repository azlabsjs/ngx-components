import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
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

  private state = signal<StateType>({
    value: '',
    disabled: false,
  });

  onInputChange(event?: Event) {
    const { value: v } = this.state();
    const value = (event?.target as HTMLInputElement).value.trim();
    // Case the value does not change we doe not fire any change event
    if (v === value) {
      return;
    }
    this.state.update((state) => ({ ...state, value }));
    this.dispatchValueChange();
    event?.stopPropagation();
  }

  onSearchClick(event?: Event) {
    event?.preventDefault();
    event?.stopImmediatePropagation();
    event?.stopPropagation();
  }

  private dispatchValueChange() {
    const { value } = this.state();
    this.valueChange.emit(value);
  }
}
