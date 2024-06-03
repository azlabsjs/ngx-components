import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextAreaInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-textarea-input',
  templateUrl: './ngx-textarea-input.component.html',
  styles: [],
})
export class NgxTextAreaInputComponent {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() inputConfig!: TextAreaInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs
}
