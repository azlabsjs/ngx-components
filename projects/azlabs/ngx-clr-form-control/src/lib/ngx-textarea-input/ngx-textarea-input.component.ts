import { Component, Input, ContentChild, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextAreaInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-textarea-input',
  templateUrl: './ngx-textarea-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxTextAreaInputComponent {
  //#region component inputs
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TextAreaInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;
  //#endregion
}
