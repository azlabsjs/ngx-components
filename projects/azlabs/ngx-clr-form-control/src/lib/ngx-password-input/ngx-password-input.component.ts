import { ChangeDetectionStrategy, Component, Input, TemplateRef, signal as createSignal } from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextInput } from '@azlabsjs/smart-form-core';
import { SHARED_DIRECTIVES, SHARED_PIPES } from '../common';

@Component({
  standalone: true,
  imports: [...SHARED_DIRECTIVES, ...SHARED_PIPES],
  selector: 'ngx-password-input',
  templateUrl: './ngx-password-input.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxPasswordInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  @Input() config!: TextInput;
  @Input() input!: TemplateRef<any>;

  protected signal = createSignal({ showPassword: false });

  public toggle() {
    this.signal.update(({ showPassword }) => ({ showPassword: !showPassword }));
  }

}
