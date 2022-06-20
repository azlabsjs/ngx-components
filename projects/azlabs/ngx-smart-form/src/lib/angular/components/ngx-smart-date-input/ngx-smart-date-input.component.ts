import { Component, ContentChild, Inject, Input, LOCALE_ID, TemplateRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { JSDate } from '@iazlabs/js-datetime';
import { DateInput } from '../../../core';

@Component({
  selector: 'ngx-smart-date-input',
  templateUrl: './ngx-smart-date-input.component.html',
  styles: [
    `
      :host ::ng-deep .clr-validate-icon.ng-star-inserted {
        display: none;
      }
    `,
  ],
})
export class NgxSmartDateInputComponent {
  @Input() control!: FormControl;
  @Input() showLabelAndDescription = true;
  @Input() inputConfig!: DateInput;
  today = JSDate.format();
  @ContentChild('input') inputRef!: TemplateRef<any>;

  constructor(@Inject(LOCALE_ID) private appLocalID: string) {}

  // tslint:disable-next-line: typedef
  onBlur() {
    const locale = this.appLocalID;
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
      // tslint:disable-next-line: max-line-length
      const output: { days: string; month: string; year: string } = {
        days: value.substr(0, 2),
        month: value.substr(2, 2),
        year: value.substr(4),
      };
      if (locale.match(/fr/)) {
        this.control.setValue(`${output.days}/${output.month}/${output.year}`);
      } else {
        this.control.setValue(`${output.month}/${output.days}/${output.year}`);
      }
    }
  }
}
