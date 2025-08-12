import { AbstractControl, FormGroup } from '@angular/forms';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';

/** @internal */
export type FormGroupState = {
  formGroup: FormGroup<any>;
  detached: AbstractControl<any, any>[];
};

/** @internal */
export type FormModelState = FormGroupState & {
  form?: FormConfigInterface;
};
