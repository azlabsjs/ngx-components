import { Component, ContentChild, EventEmitter, Input, OnInit, Output, TemplateRef } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';

@Component({
  selector: 'ngx-smart-phone-input',
  templateUrl: './ngx-smart-phone-input.component.html',
  styles: [],
})
export class PhoneInputComponent {
  //#region Component inputs
  @Input() control!: AbstractControl & FormControl;
  @Input() describe = true;
  @Input('inputConfig') config!: InputConfigInterface;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component event emitter
  @Output() focus = new EventEmitter<FocusEvent>();
  @Output() blur = new EventEmitter<FocusEvent>();
  //#endregion Component event emitter

  onBlur(event: FocusEvent) {
    this.control!.markAsTouched();
    this.blur.emit(event);
  }

  onFocus(event: FocusEvent) {
    this.control!.markAsTouched();
    this.focus.emit(event);
  }
}
