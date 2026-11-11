import { AbstractControl, AsyncValidatorFn, FormBuilder, FormGroup, ValidatorFn, Validators, FormArray } from '@angular/forms';
import { CustomValidators, equalsValidator, existsValidator, uniqueValidator } from '../validators';
import { DateInput, NumberInput, TextInput, OptionsInput, InputTypes, InputGroup, InputOption, InputConfigInterface } from '@azlabsjs/smart-form-core';
import { JSDate } from '@azlabsjs/js-datetime';
import { RequestClient } from '../../http';

type InputConfigType = InputConfigInterface | InputGroup;

function nullIfEmpty<T>(value: T) {
  if (typeof value === 'undefined' || value === null) {
    return value;
  }
  if (String(value).trim() === '') {
    return undefined;
  }

  return value as T;
}

function required(config: InputConfigInterface) {
  return (!!config.constraints && 'required' in config.constraints && Boolean(config.constraints.required));
}

function disabled(config: InputConfigInterface) {
  return (!!config.constraints && 'disabled' in config.constraints && Boolean(config.constraints.disabled));
}


/** @internal */
function isDateConfig(input: InputConfigInterface): input is DateInput {
  return input.type === InputTypes.DATE_INPUT;
}

/** @internal */
function isNumberConfig(input: InputConfigInterface): input is NumberInput {
  return input.type === InputTypes.NUMBER_INPUT;
}

/** @internal */
function isTextInputConfig(input: InputConfigInterface): input is TextInput {
  return input.type === InputTypes.TEXT_INPUT || input.type === InputTypes.EMAIL_INPUT || input.type === InputTypes.PASSWORD_INPUT;
}

/** @description Helper class for generating angular reactive form controls with errors validation */
export class ComponentReactiveFormHelpers {
  /**
   * @description Generate an abstract form control using input configuration
   *
   * @param builder Angular forms reactive formbuilder
   * @param inputs dynamic input configuration
   */
  static buildFormGroupFromInputConfig(builder: FormBuilder, inputs: InputConfigType[], requestClient?: RequestClient) {
    const group = builder.group({});

    for (const input of inputs) {
      if (input.isRepeatable) {
        const array = new FormArray<AbstractControl>([]);
        group.addControl(input.name, array);
        continue;
      }

      const config = input as InputGroup;

      if (typeof config.inputs !== 'undefined' && Array.isArray(config.inputs)) {
        const formgroup = ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(builder, config.inputs, requestClient);

        if (required(input)) {
          formgroup.addValidators(Validators.required);
        }

        group.addControl(input.name, formgroup);
        continue;
      }

      group.addControl(config.name, ComponentReactiveFormHelpers.buildControl(builder, config, requestClient));

    }

    return group;
  }

  public static buildGroup(builder: FormBuilder, inputs: InputConfigInterface[], requestClient?: RequestClient) {
    const group = builder.group({});

    for (const config of inputs) {

      if (config.type !== InputTypes.CHECKBOX_INPUT) {
        group.addControl(config.name, ComponentReactiveFormHelpers.buildControl(builder, config, requestClient));
      } else {
        group.addControl(config.name, ComponentReactiveFormHelpers.buildArray(builder, config));
      }

    }

    return group;
  }

  public static buildControl(builder: FormBuilder, config: InputConfigInterface, requestClient?: RequestClient) {
    const validators = [required(config) ? Validators.required : Validators.nullValidator];
    const asyncValidators: AsyncValidatorFn[] = [];
    let hasEqualsConstraint = false;
    let hasEmailConstraint = false;
    if (isTextInputConfig(config)) {
      if (!!config.constraints?.max) {
        validators.push(Validators.maxLength(nullIfEmpty(config.constraints?.max) ?? Math.pow(2, 31) - 1));
      }

      if (!!config.constraints?.min) {
        validators.push(Validators.minLength(nullIfEmpty(config.constraints?.min) ?? 1));
      }

      if (!!config.constraints?.email) {
        validators.push(Validators.email);
      }

      if (!!config.constraints?.pattern?.fn) {
        validators.push(Validators.pattern(nullIfEmpty(config.constraints?.pattern?.fn) ?? ''));
      }
    }


    if (config.type === InputTypes.EMAIL_INPUT) {
      validators.push(Validators.email);
      hasEmailConstraint = true;
    }

    if (isNumberConfig(config)) {
      if (!!config.constraints?.min) {
        validators.push(Validators.min(nullIfEmpty(config.constraints?.min) ?? -1));
      }

      if (!!config.constraints?.max) {
        validators.push(Validators.max(nullIfEmpty(config.constraints?.max) ?? Math.pow(2, 31) - 1));
      }
    }


    if (isDateConfig(config)) {

      let format: string | ((value: unknown) => string) = 'DD/MM/YYYY';
      if ('constraints' in config) {
        const constraint = config.constraints ?? {};
        format = 'format' in constraint ? String(constraint.format ?? 'DD/MM/YYYY') : format;
      }

      validators.push(CustomValidators.isValidDate);

      if (!!config.constraints?.min) {
        validators.push(CustomValidators.minDate(JSDate.format(nullIfEmpty(config.constraints?.min), 'YYYY-MM-DD'), format));
      }

      if (!!config.constraints?.max) {
        validators.push(CustomValidators.maxDate(JSDate.format(nullIfEmpty(config.constraints?.max), 'YYYY-MM-DD'), format));
      }

    }

    if (config.constraints && config.constraints.unique && requestClient) {
      asyncValidators.push(uniqueValidator(requestClient, config.constraints.unique));
    }

    if (config.constraints && config.constraints.exists && requestClient) {
      asyncValidators.push(existsValidator(requestClient, config.constraints.exists));
    }

    if (config.constraints && config.constraints.equals) {
      validators.push(equalsValidator(config.constraints.equals.fn));
      hasEqualsConstraint = true;
    }

    // TODO: Add unsupported constraints

    const control = builder.control({
      value: config.value,
      disabled: disabled(config),
    }, {
      validators: Validators.compose(validators),
      updateOn: asyncValidators.length > 0 || config.type === InputTypes.DATE_INPUT || hasEqualsConstraint || hasEmailConstraint ? 'blur' : 'change',
      asyncValidators,
    });


    return control;
  }

  public static buildArray(builder: FormBuilder, config: InputConfigInterface) {
    const array = new FormArray<AbstractControl>([]);
    (config as OptionsInput).options.forEach(
      (current: InputOption) => array.push(builder.control(current.selected))
    );

    if (required(config)) {
      array.setValidators(Validators.required);
    }

    return array;
  }

  public static validateFormGroupFields(control: FormGroup | FormArray): void {
    for (const value of Object.values(control.controls)) {
      if ((value instanceof FormGroup || value instanceof FormArray) && !value.valid) {
        ComponentReactiveFormHelpers.validateFormGroupFields(value);
      } else {
        ComponentReactiveFormHelpers.markControlAsTouched(value);
      }
    }
  }

  public static markControlAsTouched(control?: AbstractControl): void {
    if (control) {
      control.markAsTouched();
      control.markAsDirty();
      control.markAsPristine();
      control.updateValueAndValidity();
    }
  }

  public static clearControlValidators(control?: AbstractControl): void {
    if (control instanceof FormGroup) {
      for (const prop in control.controls) {
        const item = control.get(prop);
        if (item) {
          ComponentReactiveFormHelpers.clearControlValidators(item);
        }
      }
    } else if (control instanceof FormArray) {
      for (const item of control.controls) {
        ComponentReactiveFormHelpers.clearControlValidators(item);
      }
    } else if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  public static clearAsyncValidators(control?: AbstractControl): void {
    if (control instanceof FormGroup) {
      for (const prop in control.controls) {
        ComponentReactiveFormHelpers.clearAsyncValidators(
          control.get(prop) || undefined
        );
      }
    } else if (control instanceof FormArray) {
      for (const item of control.controls) {
        ComponentReactiveFormHelpers.clearAsyncValidators(item);
      }
    } else if (control) {
      control.clearAsyncValidators();
      control.updateValueAndValidity();
    }
  }

  public static setValidators(control?: AbstractControl, validators?: ValidatorFn | ValidatorFn[]): void {
    if (control) {
      control.setValidators(validators || null);
      control.updateValueAndValidity();
    }
  }
}


/** @description create angular form group instance from input configurations */
export function createFormGroup(builder: FormBuilder, inputs?: InputConfigInterface[], requestClient?: RequestClient) {
  return ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(builder, inputs ?? [], requestClient);
}

/** @description Creates angular form control instance from input configuration */
export function createFormControl(builder: FormBuilder, inputConfig: InputConfigInterface, requestClient?: RequestClient) {
  return ComponentReactiveFormHelpers.buildControl(builder, inputConfig, requestClient);
}

/**
 * Creates angular form control instance from input configuration
 */
export function createFormArray(builder: FormBuilder, inputConfig: InputConfigInterface) {
  return ComponentReactiveFormHelpers.buildArray(builder, inputConfig);
}
