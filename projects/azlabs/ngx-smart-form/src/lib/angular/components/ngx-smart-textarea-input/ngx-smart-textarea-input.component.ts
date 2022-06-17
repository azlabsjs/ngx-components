import { Component, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputInterface, TextAreaInput } from '../../../core';
import { InputEventArgs } from '../../types/input';

@Component({
  selector: 'ngx-smart-textarea-input',
  templateUrl: './ngx-smart-textarea-input.component.html',
  styles: [
    `
      .clr-control-container textarea {
        min-width: 100% !important;
      }
    `,
  ],
})
export class DynamicTextAreaInputComponent {
  @Input() control!: AbstractControl & FormControl;
  @Input() showLabelAndDescription = true;
  // Configuration parameters of the input
  @Input() inputConfig!: TextAreaInput;

  @Output() keyup = new EventEmitter<InputEventArgs>();
  @Output() keydown = new EventEmitter<InputEventArgs>();
  @Output() keypress = new EventEmitter<InputEventArgs>();
  @Output() blur = new EventEmitter<InputEventArgs>();
}
