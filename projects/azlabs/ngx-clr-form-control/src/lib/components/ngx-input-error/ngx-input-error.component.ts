import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  computed,
  signal,
} from '@angular/core';
import { defaultStrings } from '../../constants';
import { NgxCommonModule } from '../../common';

/** @internal */
type ErrorsType = { [prop: string]: any };

/** @internal */
const DEFAULT_ERRORS = Object.keys(defaultStrings.validation);

@Component({
  standalone: true,
  imports: [NgxCommonModule],
  selector: 'ngx-input-error',
  templateUrl: './ngx-input-error.component.html',
  styles: [
    `
      :host(.input__error_text) * {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxInputErrorComponent {
  @HostBinding('class.input__subtext') subText = true;
  @HostBinding('class.input__error_text') errorText = true;
  errors = signal<ErrorsType | null>(null);
  customErrors = computed(() => {
    const errors = this.errors();
    return errors
      ? Object.keys(errors)
          .filter((v) => DEFAULT_ERRORS.indexOf(v) === -1)
          .map((curr) => {
            return errors[curr];
          })
      : [];
  });
  defaultErrors = computed(() => {
    const errors = this.errors();
    return errors ? DEFAULT_ERRORS.filter((v) => !!errors[v]) : [];
  });

  //#region Component inputs
  @Input({ alias: 'errors' }) set setErrors(value: ErrorsType | null) {
    this.errors.set(value ?? {});
  }
  //#endregion Component inputs
}
