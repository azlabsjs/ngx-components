import { Component, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextAreaInput } from '@azlabsjs/smart-form-core';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';

@Component({
  standalone: true,
  imports: [...SHARED_DIRECTIVES, ...SHARED_PIPES],
  selector: 'ngx-textarea-input',
  templateUrl: './ngx-textarea-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxTextAreaInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TextAreaInput;
  @Input() input!: TemplateRef<any>;
}
