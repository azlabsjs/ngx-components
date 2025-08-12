import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-text-input',
  templateUrl: './ngx-text-input.component.html',
})
export class NgxTextInputComponent {
  //#region component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TextInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion

  //#region component properties
  Mt = Math;
  //#region
}
