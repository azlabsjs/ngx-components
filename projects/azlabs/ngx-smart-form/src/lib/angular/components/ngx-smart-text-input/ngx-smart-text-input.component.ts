import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputTypes, TextInput } from '../../../core';
import { getObjectProperty } from '@iazlabs/js-object';
import { InputEventArgs } from '../../types/input';

@Component({
  selector: 'ngx-smart-text-input',
  templateUrl: './ngx-smart-text-input.component.html',
})
export class TextInputComponent {
  @Input() control!: AbstractControl & FormControl;
  @Input() showLabelAndDescription = true;
  // Configuration parameters of the input
  @Input() inputConfig!: TextInput;

  @Output() keyup = new EventEmitter<InputEventArgs>();
  @Output() keydown = new EventEmitter<InputEventArgs>();
  @Output() keypress = new EventEmitter<InputEventArgs>();
  @Output() blur = new EventEmitter<InputEventArgs>();

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
