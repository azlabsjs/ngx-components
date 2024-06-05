import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { InputTypes, TextInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-text-input',
  templateUrl: './ngx-text-input.component.html',
})
export class NgxTextInputComponent {
  //#region Component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() inputConfig!: TextInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion Component inputs

  //#region Component properties
  inputTypes = InputTypes;
  Mt = Math;
  //#region Component properties
}
