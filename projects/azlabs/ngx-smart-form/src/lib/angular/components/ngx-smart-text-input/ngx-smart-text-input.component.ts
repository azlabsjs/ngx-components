import { Component, Input, Output, EventEmitter, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputTypes, TextInput } from '../../../core';
import { getObjectProperty } from '@iazlabs/js-object';
import { InputEventArgs } from '../../types/input';

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
