import {
  AbstractControl,
  FormArray,
  FormGroup,
  FormControl,
} from '@angular/forms';

/**
 * Deep clones the given AbstractControl, preserving values, validators, async validators, and disabled status.
 * @param control AbstractControl
 *
 * @returns {AbstractControl}
 */
export function cloneAbstractControl<T extends AbstractControl>(control: T): T {
  let newControl: T;

  if (control instanceof FormGroup) {
    const group = new FormGroup({}, control.validator, control.asyncValidator);
    const controls = control.controls;
    Object.keys(controls).forEach((key) => {
      group.addControl(key, cloneAbstractControl(controls[key]));
    });
    newControl = group as any;
  } else if (control instanceof FormArray) {
    const array = new FormArray<AbstractControl<any>>(
      [],
      control.validator,
      control.asyncValidator
    );
    control.controls.forEach((f) => array.push(cloneAbstractControl(f)));
    newControl = array as any;
  } else if (control instanceof FormControl) {
    newControl = new FormControl(
      control.value,
      control.validator,
      control.asyncValidator
    ) as any;
  } else {
    throw new Error('Error: unexpected control value');
  }

  if (control.disabled) {
    newControl.disable({ emitEvent: false });
  }

  if (control.enabled) {
    newControl.enable({ emitEvent: false });
  }

  if (control.parent && typeof newControl?.setParent === 'function') {
    newControl?.setParent(control.parent);
  }

  if (control.errors) {
    newControl.setErrors(control.errors);
  }

  return newControl;
}
