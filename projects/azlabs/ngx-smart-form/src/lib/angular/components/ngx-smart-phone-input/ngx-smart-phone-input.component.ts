import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputConfigInterface } from '../../../core';

@Component({
  selector: 'ngx-smart-phone-input',
  templateUrl: './ngx-smart-phone-input.component.html',
  styles: [],
})
export class PhoneInputComponent implements OnInit {
  @Input() control!: AbstractControl & FormControl;
  @Input() showLabelAndDescription = true;
  // Configuration parameters of the input
  @Input() inputConfig!: InputConfigInterface;

  //#region Component event emitter
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  //#endregion Component event emitter

  ngOnInit() {}

  onBlur(event: FocusEvent) {
    this.control!.markAsTouched();
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent) {
    this.control!.markAsTouched();
    this.focus.emit(event);
  }
}
