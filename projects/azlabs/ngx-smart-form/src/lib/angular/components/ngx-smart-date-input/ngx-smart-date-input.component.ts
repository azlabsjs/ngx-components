import {
  Component,
  ContentChild,
  Inject,
  Input,
  LOCALE_ID,
  TemplateRef
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { DateInput } from '@azlabsjs/smart-form-core';

@Component({
  selector: 'ngx-smart-date-input',
  templateUrl: './ngx-smart-date-input.component.html',
  styles: [
    `
      :host ::ng-deep .clr-validate-icon.ng-star-inserted {
        display: none;
      }
      :host ::ng-deep .clr-date-container .clr-input-wrapper {
        width: 100% !important;
        max-width: 100% !important;
      }

      :host ::ng-deep .clr-input-group {
        width: 100% !important;
        max-width: 100% !important;
      }
    `,
  ],
})
export class NgxSmartDateInputComponent {
  // #region Component inputs
  @Input() control!: FormControl;
  @Input() describe = true;
  @Input() inputConfig!: DateInput;
  // #endregion Component inputs
  @ContentChild('input') inputRef!: TemplateRef<any>;

  /**
   * Creates an instance of Date Input Component
   * 
   * @param locale 
   */
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  // tslint:disable-next-line: typedef
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
