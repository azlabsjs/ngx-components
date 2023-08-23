import { Component, HostBinding, Input } from '@angular/core';
import { defaultStrings } from '../../constants';

type ErrorsType = { [prop: string]: any };

@Component({
  selector: 'ngx-input-error',
  templateUrl: './ngx-input-error.component.html',
  styles: [
    `
      :host(.input__error_text) * {
        display: block;
      }
    `,
  ],
})
export class NgxInputErrorComponent {
  @HostBinding('class.input__subtext') subText = true;
  @HostBinding('class.input__error_text') errorText = true;
  private _errors!: ErrorsType | null;
  @Input() set errors(value: ErrorsType | null) {
    this._errors = value;
    if (value) {
      this._customErrors = Object.keys(value)
        .filter((v) => this.defaults.indexOf(v) === -1)
        .map((curr) => {
          return value[curr];
        });
    }
  }
  get errors() {
    return this._errors;
  }

  private _customErrors!: string[];
  get customErrors() {
    return this._customErrors;
  }

  get defaultErrors() {
    return this.errors
      ? this.defaults.filter((v) => !!(this.errors as ErrorsType)[v])
      : [];
  }

  // #region Component internal properties
  defaults!: string[];
  // #endregion Component internal properties

  constructor() {
    this.defaults = Object.keys(defaultStrings.validation);
  }
}
