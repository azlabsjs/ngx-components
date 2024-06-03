import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef,
  signal,
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import { TextInput } from '@azlabsjs/smart-form-core';
import { NgxCommonModule } from '../../common';

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-password-input',
  templateUrl: './ngx-password-input.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxPasswordInputComponent {
  @Input() control!: AbstractControl;
  @Input() describe = true;
  // Configuration parameters of the input
  @Input() inputConfig!: TextInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;

  // tslint:disable-next-line: variable-name
  Mt = Math;
  showPassword = signal({ showPassword: false });

  public toggle() {
    this.showPassword.update(({ showPassword }) => ({
      showPassword: !showPassword,
    }));
  }
}
