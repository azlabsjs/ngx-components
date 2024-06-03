import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { InputRequireIfConfig } from '@azlabsjs/smart-form-core';

/** @internal */
export interface BindingInterface {
  key: string;
  abstractControl: AbstractControl;
  setValueFactory?: () => (...args: [FormGroup<any>, string]) => void;
  binding: InputRequireIfConfig | undefined;
  validators: ValidatorFn | ValidatorFn[] | undefined | null;
  asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | undefined | null;
}
