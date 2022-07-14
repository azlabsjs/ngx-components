import { AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { InputRequireIfConfig } from '@azlabsjs/smart-form-core';

// @internal
export interface BindingInterface {
  key: string;
  binding: InputRequireIfConfig | undefined;
  validators: ValidatorFn | ValidatorFn[] | undefined;
  asyncValidators: AsyncValidatorFn | AsyncValidatorFn[] | undefined;
}
