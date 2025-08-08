import { AbstractControl, FormGroup } from '@angular/forms';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';

/** @internal */
export type FormModelState = {
  formGroup: FormGroup<any>;
  detached: AbstractControl<any, any>[];
  form: FormConfigInterface;
};
