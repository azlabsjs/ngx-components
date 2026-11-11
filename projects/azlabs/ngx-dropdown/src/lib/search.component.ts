import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal as createSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

/** @internal */
type StateType = {
  value: string;
  disabled: boolean;
};

@Component({
  standalone: true,
  imports: [FormsModule],
  selector: 'ngx-azl-dropdown-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DropdownSearchComponent {
  @Output() valueChange = new EventEmitter();
  @Input() placeholder: string = 'Search...';

  protected signal = createSignal<StateType>({
    value: '',
    disabled: false,
  });

  onInputChange(event?: Event) {
    const { value: v } = this.signal();
    const value = (event?.target as HTMLInputElement).value.trim();
    if (v === value) {
      return;
    }
    this.signal.update((state) => ({ ...state, value }));

    this.dispatchValueChange();
    
    event?.preventDefault();
    event?.stopPropagation();
  }

  onSearchClick(event?: Event) {
    event?.preventDefault();
    event?.stopPropagation();
  }

  private dispatchValueChange() {
    const { value } = this.signal();
    this.valueChange.emit(value);
  }
}
