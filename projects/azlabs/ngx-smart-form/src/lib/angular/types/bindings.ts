import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { InputRequireIfConfig } from '../../core';

// @internal
export interface BindingInterface {
  key: string;
  binding: InputRequireIfConfig | undefined;
  validators: ValidatorFn | ValidatorFn[] | undefined;
  asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | undefined;
}
