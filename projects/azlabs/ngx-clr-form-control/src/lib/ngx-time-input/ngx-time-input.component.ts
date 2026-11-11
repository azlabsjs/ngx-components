import { ChangeDetectionStrategy, Component, Input, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TimeInput } from '@azlabsjs/smart-form-core';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';

@Component({
  standalone: true,
  imports: [ ...SHARED_DIRECTIVES, ...SHARED_PIPES],
  selector: 'ngx-time-input',
  templateUrl: './ngx-time-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxTimeInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TimeInput;
  @Input() input!: TemplateRef<any>;
}
