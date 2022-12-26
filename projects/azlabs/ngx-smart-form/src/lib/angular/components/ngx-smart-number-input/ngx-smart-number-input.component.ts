import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { getObjectProperty } from '@azlabsjs/js-object';
import { NumberInput } from '@azlabsjs/smart-form-core';

@Component({
  selector: 'ngx-smart-number-input',
  templateUrl: './ngx-smart-number-input.component.html',
  styles: [],
})
export class NgxSmartNumberInputComponent {
  //#region Component inputs
  @Input() control!: UntypedFormControl;
  @Input() describe = true;
  @Input() inputConfig!: NumberInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  maxNumberSize(): number {
    return Math.pow(2, 31) - 1;
  }

  getErrorAsNumber(value?: object | number, key?: string): number | string {
    return typeof value === 'number'
      ? value
      : getObjectProperty(value, key || '');
  }
}
