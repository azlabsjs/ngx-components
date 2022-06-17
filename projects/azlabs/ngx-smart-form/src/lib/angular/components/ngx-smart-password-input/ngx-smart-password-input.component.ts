import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { TextInput } from '../../../core';
import { map } from 'rxjs/operators';
import { getObjectProperty } from '@iazlabs/js-object';
import { InputEventArgs } from '../../types/input';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'ngx-smart-password-input',
  templateUrl: './ngx-smart-password-input.component.html',
  styles: [
    `
      .password-clr-input-wrapper {
        position: relative;
      }
      .password-trigger {
        position: absolute;
        top: 10px;
        right: 13px;
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartPasswordInputComponent {
  @Input() control!: AbstractControl & FormControl;
  @Input() showLabelAndDescription = true;
  // Configuration parameters of the input
  @Input() inputConfig!: TextInput;

  @Output() keyup = new EventEmitter<InputEventArgs>();
  @Output() keydown = new EventEmitter<InputEventArgs>();
  @Output() keypress = new EventEmitter<InputEventArgs>();
  @Output() blur = new EventEmitter<InputEventArgs>();

  // tslint:disable-next-line: variable-name
  private _showPassword = new BehaviorSubject(false);
  get state$() {
    return this._showPassword
      .asObservable()
      .pipe(map((state) => ({ showPassword: state })));
  }

  public togglePassWordInput() {
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
