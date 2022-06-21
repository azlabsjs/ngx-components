import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { TextAreaInput } from '../../../core';

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
  //#region Component inputs
  @Input() control!: AbstractControl & FormControl;
  @Input() describe = true;
  @Input() inputConfig!: TextAreaInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs
}
