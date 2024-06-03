import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { InputConfigInterface, InputGroup } from '@azlabsjs/smart-form-core';
import { AngularReactiveFormBuilderBridge } from '../../types';

/** @internal Set value for formgroup form controls */
export function setFormValue(
  builder: AngularReactiveFormBuilderBridge,
  formgroup: FormGroup,
  values: { [index: string]: any },
  configs?: InputConfigInterface[] | InputConfigInterface
) {
  for (const [key, value] of Object.entries(values)) {
    const config_ = Array.isArray(configs)
      ? configs?.find((config) => config.name === key)
      : configs;
    if (typeof config_ === 'undefined' || config_ === null) {
      continue;
    }
    if (formgroup.controls[key] && value) {
      if (formgroup.controls[key] instanceof FormGroup) {
        setFormValue(
          builder,
          formgroup.controls[key] as FormGroup,
          value,
          config_
        );
      } else if (
        formgroup.controls[key] instanceof FormArray &&
        Boolean(config_?.isRepeatable) === true &&
        ((config_ as InputGroup)?.children ?? []).length > 0
      ) {
        const controls = (config_ as InputGroup)?.children;
        const children = Array.isArray(controls)
          ? controls
          : [controls].filter(
              (current) => typeof current !== 'undefined' && current !== null
            );
        const values_ = Array.isArray(value) ? value : [];
        const array_ = new FormArray<AbstractControl<any>>([]);
        for (const current of values_) {
          const tmp = builder.group(children) as FormGroup;
          setFormGroupValue(tmp, current);
          array_.push(tmp);
        }
        formgroup.controls[key] = array_;
      } else if (
        formgroup.controls[key] instanceof FormArray &&
        Boolean(config_?.isRepeatable)
      ) {
        const values_ = Array.isArray(value) ? value : [];
        const array_ = new FormArray<AbstractControl<any>>([]);
        for (const current of values_) {
          const tmp = builder.control(config_);
          tmp.setValue(current);
          array_.push(tmp);
        }
        formgroup.controls[key] = array_;
      } else {
        formgroup.controls[key]?.setValue(value);
      }
    }
  }
}

/** @internal */
export function setFormGroupValue(
  formgroup: FormGroup,
  values: { [index: string]: any }
) {
  for (const [key, value] of Object.entries(values)) {
    try {
      formgroup.controls[key].setValue(value);
    } catch (error) {
      //
    }
  }
}
