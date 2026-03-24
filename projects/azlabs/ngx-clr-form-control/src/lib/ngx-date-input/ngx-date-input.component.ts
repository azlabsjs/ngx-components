import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Inject,
  Input,
  LOCALE_ID,
  TemplateRef,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { DateInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-date-input',
  templateUrl: './ngx-date-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxDateInputComponent {
  // #region component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: DateInput;
  // #endregion

  @ContentChild('input') inputRef!: TemplateRef<any>;

  /** @description creates an instance of date input */
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  onBlur() {
    const locale = this.locale;
    if (this.control.value) {
      const value: string = this.control.value as string;
      if (value === '' || value.length === 0) {
        this.control.setValue(null);
        return;
      }
      const match = value.match(
        locale.match(/fr/)
          ? /(0*([1-9]|[12][0-9]|3[01]))\/(0*([1-9]|1[0-2]))\/\d{4}/
          : /(0*([1-9]|1[0-2]))\/(0*([1-9]|[12][0-9]|3[01]))\/\d{4}/
      );
      if (match) {
        return;
      }
      const output: { days: string; month: string; year: string } = {
        days: value.substr(0, 2),
        month: value.substr(2, 2),
        year: value.substr(4),
      };
      this.control.setValue(
        locale.match(/fr/)
          ? `${output.days}/${output.month}/${output.year}`
          : `${output.month}/${output.days}/${output.year}`
      );
    }
  }
}
