import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import { InputRequireIfConfig } from '@azlabsjs/smart-form-core';

// @internal
export type DetachedInputType = [
  (formgroup: FormGroup<any>, key: string) => void,
  AbstractControl
];

/** @internal */
export interface BindingInterface {
  isdependency: (name: string) => boolean;
  dependencyChanged: (
    detached: Map<string, AbstractControl>,
    formgroup: FormGroup,
    dependency: string,
    value: unknown
  ) => [[string, AbstractControl][], [string, AbstractControl][]];
  setValueFactory?: () => (...args: [FormGroup<any>, string]) => void;
  binding: InputRequireIfConfig | undefined;
  validators?: ValidatorFn | ValidatorFn[] | undefined | null;
  asyncValidators?: AsyncValidatorFn | AsyncValidatorFn[] | undefined | null;
}
