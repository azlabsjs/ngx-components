import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Observable } from 'rxjs';

// @internal
export type FormConfigType = { controlConfigs: InputConfigInterface[] };

/** @internal */
export type FormGroupState = {
  formGroup: FormGroup<any>;
  detached: Observable<AbstractControl<any, any>[]>; // TODO: change it to signal when using signal API
};

/** @internal */
export type FormModelState<T extends FormConfigType> = FormGroupState & {
  form?: T;
};

/** @internal */
export type Optional<T> = T | null | undefined;
