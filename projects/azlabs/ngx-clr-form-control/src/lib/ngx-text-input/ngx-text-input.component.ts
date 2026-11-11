import { Component, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextInput } from '@azlabsjs/smart-form-core';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';

@Component({
  standalone: true,
  imports: [...SHARED_DIRECTIVES, ...SHARED_PIPES],
  selector: 'ngx-text-input',
  templateUrl: './ngx-text-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTextInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TextInput;
  @Input() input!: TemplateRef<any>;
}
