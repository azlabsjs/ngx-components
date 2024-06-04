import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
  forwardRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ClarityModule } from '@clr/angular';

@Component({
  standalone: true,
  imports: [CommonModule, ClarityModule],
  selector: 'ngx-checkbox',
  template: `
    <div class="clr-checkbox-wrapper">
      <input
        class="clr-checkbox"
        type="checkbox"
        [checked]="isChecked"
        (change)="onChanged($event)"
        (blur)="onBlur($event)"
        [disabled]="disabled"
      />
      <label class="clr-control-label">{{ text }}</label>
    </div>
  `,
  //   styleUrls: ['./checkbox.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements ControlValueAccessor {
  //#region Component inputs
  @Input() text!: string | undefined;
  @Input() disabled = false;
  @Input({ alias: 'checked' }) isChecked = false;
  //#endregion Component inputs

  //#region Component outputs
  @Output() onChange = new EventEmitter<boolean>();
  //#endregion Component outputs

  _onChange: (...args: any) => void = () => {};
  onBlur: (...args: any) => void = () => {};

  @HostListener('click', ['$event']) onClick(e: Event) {
    this.isChecked = !this.isChecked;
    this.onChange.emit(this.isChecked);
    e?.preventDefault();
  }

  writeValue(obj: boolean): void {
    console.log('Writing value....', obj);
    this.isChecked = obj;
  }

  registerOnChange(fn: (...args: any) => void): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: (...args: any) => void): void {
    this.onBlur = fn;
  }

  setDisabledState?(disabled: boolean): void {
    this.disabled = disabled;
  }

  onChanged(e: Event) {
    this.isChecked = e && e.target && (e.target as any).checked;
    this._onChange(this.isChecked);
  }
}
