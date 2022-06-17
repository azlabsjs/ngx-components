import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputInterface } from '../../../core';

@Component({
  selector: 'ngx-smart-phone-input',
  templateUrl: './ngx-smart-phone-input.component.html',
  styles: [],
})
export class PhoneInputComponent {
  @Input() control!: AbstractControl & FormControl;
  @Input() showLabelAndDescription = true;
  // Configuration parameters of the input
  @Input() inputConfig!: InputInterface;
}
