import {
  ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef
} from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import { getObjectProperty } from '@azlabsjs/js-object';
import { TextInput } from '@azlabsjs/smart-form-core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'ngx-smart-password-input',
  templateUrl: './ngx-smart-password-input.component.html',
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartPasswordInputComponent {
  @Input() control!: AbstractControl & UntypedFormControl;
  @Input() describe = true;
  // Configuration parameters of the input
  @Input() inputConfig!: TextInput;
  @ContentChild('input') inputRef!: TemplateRef<any>;

  // tslint:disable-next-line: variable-name
  private _showPassword = new BehaviorSubject(false);
  get state$() {
    return this._showPassword
      .asObservable()
      .pipe(map((state) => ({ showPassword: state })));
  }

  public toggle() {
    this._showPassword.next(!this._showPassword.getValue());
  }

  maxNumberSize() {
    return Math.pow(2, 31) - 1;
  }

  getErrorAsNumber(value: object | number, key?: string) {
    return typeof value === 'number'
      ? value
      : getObjectProperty(value, key || '');
  }
}
