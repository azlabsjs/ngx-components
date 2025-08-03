import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ngx-checkbox',
  template: `
    <div class="clr-checkbox-wrapper">
      <input
        class="clr-checkbox"
        type="checkbox"
        [checked]="checked"
        (change)="onChanged($event)"
        (blur)="onBlur($event)"
        [disabled]="disabled"
      />
      <label class="clr-control-label">{{ text }}</label>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent {
  //#region component inputs
  @Input() text!: string | undefined;
  @Input() disabled = false;
  @Input({ alias: 'checked' }) checked = false;
  //#endregion

  //#region component outputs
  @Output() change = new EventEmitter<boolean>();
  //#endregion

  _onChange: (...args: any) => void = () => {};
  onBlur: (...args: any) => void = () => {};

  @HostListener('click', ['$event']) onClick(e: Event) {
    this.checked = !this.checked;
    this.change.emit(this.checked);
    e?.preventDefault();
  }

  onChanged(e: Event) {
    this.checked = e && e.target && (e.target as any).checked;
  }
}
