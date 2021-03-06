import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputTypes, TextInput } from '@azlabsjs/smart-form-core';
import { getObjectProperty } from '@azlabsjs/js-object';

@Component({
  selector: 'ngx-smart-text-input',
  templateUrl: './ngx-smart-text-input.component.html',
})
export class TextInputComponent {

  //#region Component inputs
  @Input() control!: AbstractControl & FormControl;
  @Input() describe = true;
  @Input() inputConfig!: TextInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  public inputTypes = InputTypes;
  maxNumberSize = () => Math.pow(2, 31) - 1;

  /**
   *
   * @param value
   * @param key
   */
  getErrorAsNumber(value: { [index: string]: any } | number, key?: string) {
    return typeof value === 'number'
      ? value
      : getObjectProperty(value, key || '');
  }
}
