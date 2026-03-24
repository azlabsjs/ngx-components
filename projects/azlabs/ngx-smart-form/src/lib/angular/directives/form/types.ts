import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';

// @internal
export type FormConfigType = { controlConfigs: InputConfigInterface[] };

/** @internal */
export type FormGroupState = {
  formGroup: FormGroup<any>;
  detached: AbstractControl<any, any>[];
};

/** @internal */
export type FormModelState<T extends FormConfigType> = FormGroupState & {
  form?: T;
};

/** @internal */
export type Optional<T> = T | null | undefined;
