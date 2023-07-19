import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { TextAreaInput } from '@azlabsjs/smart-form-core';

@Component({
  selector: 'ngx-textarea-input',
  templateUrl: './ngx-textarea-input.component.html',
  styles: [],
})
export class NgxTextAreaInputComponent {
  //#region Component inputs
  @Input() control!: AbstractControl & UntypedFormControl;
  @Input() describe = true;
  @Input() inputConfig!: TextAreaInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs
}
