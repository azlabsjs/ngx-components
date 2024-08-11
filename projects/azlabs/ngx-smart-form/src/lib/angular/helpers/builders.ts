import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
  FormArray,
} from '@angular/forms';
import {
  CustomValidators,
  equalsValidator,
  existsValidator,
  uniqueValidator,
} from '../validators';
import {
  DateInput,
  NumberInput,
  TextInput,
  OptionsInputConfigInterface,
  FormConfigInterface,
  InputTypes,
  InputGroup,
  InputOptions,
  InputOption,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
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

/** @description Helper class for generating angular reactive form controls with errors validation */
export class ComponentReactiveFormHelpers {
  /**
   * @description Generate an abstract form control using input configuration
   *
   * @param builder Angular forms reactive formbuilder
   * @param inputs dynamic input configuration
   */
  static buildFormGroupFromInputConfig(
    builder: FormBuilder,
    inputs: InputConfigType[],
    requestClient?: RequestClient
  ) {
    // Build the outer form group
    const group = builder.group({});
    for (const input of inputs) {
      if (input.isRepeatable) {
        const array = new FormArray<AbstractControl>([]);
        group.addControl(input.name, array);
        continue;
      }
      const config = input as InputGroup;
      if (
        typeof config.children !== 'undefined' &&
        Array.isArray(config.children)
      ) {
        const formgroup =
          ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
            builder,
            config.children,
            requestClient
          );
        if (!!input?.rules?.isRequired || !!input?.constraints?.required) {
          formgroup.addValidators(Validators.required);
        }
        group.addControl(input.name, formgroup);
        continue;
      }
      group.addControl(
        config.name,
        ComponentReactiveFormHelpers.buildControl(
          builder,
          config,
          requestClient
        )
      );
    }
    return group;
  }

  public static buildGroup(
    builder: FormBuilder,
    inputs: InputConfigInterface[],
    requestClient?: RequestClient
  ) {
    const group = builder.group({});
    for (const config of inputs) {
      if (config.type !== InputTypes.CHECKBOX_INPUT) {
        group.addControl(
          config.name,
          ComponentReactiveFormHelpers.buildControl(
            builder,
            config,
            requestClient
          )
        );
      } else {
        group.addControl(
          config.name,
          ComponentReactiveFormHelpers.buildArray(builder, config)
        );
      }
    }
    return group;
  }

  public static buildControl(
    builder: FormBuilder,
    config: InputConfigInterface,
    requestClient?: RequestClient
  ) {
    const validators = [
      !!config.rules?.isRequired || !!config?.constraints?.required
        ? Validators.required
        : Validators.nullValidator,
    ];
    const asyncValidators: AsyncValidatorFn[] = [];
    let hasEqualsConstraint = false;
    let hasEmailConstraint = false;
    if (
      config.type === InputTypes.TEXT_INPUT ||
      config.type === InputTypes.EMAIL_INPUT ||
      config.type === InputTypes.PASSWORD_INPUT
    ) {
      // Checks if maxlength rule is set to true and apply the rule to the input
      !!config.rules?.maxLength || (config as TextInput).constraints?.max
        ? validators.push(
            Validators.maxLength(
              nullIfEmpty((config as TextInput).maxLength) ??
                nullIfEmpty((config as TextInput).constraints?.max) ??
                Math.pow(2, 31) - 1
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
      // Checks if maxlength rule is set to true and apply the rule to the input
      !!config.rules?.minLength || (config as TextInput).constraints?.min
        ? validators.push(
            Validators.minLength(
              nullIfEmpty((config as TextInput).minLength) ??
                nullIfEmpty((config as TextInput).constraints?.min) ??
                1
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
      !!config.rules?.email || !!(config as TextInput).constraints?.email
        ? validators.push(Validators.email)
        : // tslint:disable-next-line:no-unused-expression
          null;
      !!config.rules?.pattern || !!(config as TextInput).constraints?.pattern
        ? validators.push(
            Validators.pattern(
              nullIfEmpty((config as TextInput).pattern) ??
                nullIfEmpty((config as TextInput).constraints?.pattern?.fn) ??
                ''
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
    }

    // We add an email validator if the input type is email
    if (config.type === InputTypes.EMAIL_INPUT) {
      validators.push(Validators.email);
      hasEmailConstraint = true;
    }
    // Check for min an max rules on number inputs and apply validation to the input
    if (config.type === InputTypes.NUMBER_INPUT) {
      config.rules?.min || (config as NumberInput).constraints?.min
        ? validators.push(
            Validators.min(
              nullIfEmpty((config as NumberInput).min) ??
                nullIfEmpty((config as NumberInput).constraints?.min) ??
                -1
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
      // Checks if maxlength rule is set to true and apply the rule to the input
      config.rules?.max || !!(config as NumberInput).constraints?.max
        ? validators.push(
            Validators.max(
              nullIfEmpty((config as NumberInput).max) ??
                nullIfEmpty((config as NumberInput).constraints?.max) ??
                Math.pow(2, 31) - 1
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
    }
    // Validation rules form date input
    if (config.type === InputTypes.DATE_INPUT) {
      config.rules?.minDate || !!(config as DateInput).constraints?.min
        ? validators.push(
            CustomValidators.minDate(
              JSDate.format(
                nullIfEmpty((config as DateInput).minDate) ??
                  nullIfEmpty((config as DateInput).constraints?.min),
                'YYYY-MM-DD'
              )
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
      // Checks if maxlength rule is set to true and apply the rule to the input
      config.rules?.maxDate || !!(config as DateInput).constraints?.max
        ? validators.push(
            CustomValidators.maxDate(
              JSDate.format(
                nullIfEmpty((config as DateInput).maxDate) ??
                  nullIfEmpty((config as DateInput).constraints?.max),
                'YYYY-MM-DD'
              )
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
    }

    // #region Add constraint rule
    if (config.constraints && config.constraints.unique && requestClient) {
      asyncValidators.push(
        // TODO: Pass in the http
        uniqueValidator(requestClient, config.constraints.unique)
      );
    }

    if (config.constraints && config.constraints.exists && requestClient) {
      asyncValidators.push(
        existsValidator(requestClient, config.constraints.exists)
      );
    }

    if (config.constraints && config.constraints.equals) {
      validators.push(equalsValidator(config.constraints.equals.fn));
      hasEqualsConstraint = true;
    }
    // #endregion Add constraint rule

    // Add formControl to the form group with the generated validation rules
    const control = builder.control(
      {
        value: config.value,
        disabled: config.constraints?.disabled ?? config.disabled,
      },
      {
        validators: Validators.compose(validators),
        updateOn:
          // Case the control is an email or the control is a date input or the control has equals constraint
          // or the control has async validators, we update only on blur else, we update on submit
          asyncValidators.length > 0 ||
          config.type === InputTypes.DATE_INPUT ||
          hasEqualsConstraint ||
          hasEmailConstraint
            ? 'blur'
            : 'change',
        asyncValidators,
      }
    );
    return control;
  }

  public static buildArray(builder: FormBuilder, config: InputConfigInterface) {
    const array = new FormArray<AbstractControl>([]);
    of((config as OptionsInputConfigInterface).options)
      .pipe(
        tap((options) => {
          (options as InputOptions).map(
            (current: InputOption, index: number) => {
              // Added validation rule to checkbox array
              (array as FormArray<AbstractControl>).push(
                builder.control(current.selected)
              );
            }
          );
        })
      )
      .subscribe();

    if (!!config.rules?.isRequired || !!config.constraints?.required) {
      array.setValidators(Validators.required);
    }
    return array;
  }

  public static validateFormGroupFields(control: FormGroup | FormArray): void {
    for (const value of Object.values(control.controls)) {
      if (
        (value instanceof FormGroup || value instanceof FormArray) &&
        !value.valid
      ) {
        ComponentReactiveFormHelpers.validateFormGroupFields(value);
      } else {
        ComponentReactiveFormHelpers.markControlAsTouched(value);
      }
    }
  }

  public static markControlAsTouched(
    control?: AbstractControl,
    /** @deprecated */
    field?: string
  ): void {
    if (control) {
      control.markAsTouched({ onlySelf: true });
      control.markAsDirty({ onlySelf: true });
      control.markAsPristine({ onlySelf: true });
      control.updateValueAndValidity({ onlySelf: true });
    }
  }

  public static clearControlValidators(control?: AbstractControl): void {
    if (control instanceof FormGroup) {
      for (const prop in control.controls) {
        ComponentReactiveFormHelpers.clearControlValidators(
          control.get(prop) || undefined
        );
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

  public static setValidators(
    control?: AbstractControl,
    validators?: ValidatorFn | ValidatorFn[]
  ): void {
    if (control) {
      control.setValidators(validators || null);
      control.updateValueAndValidity();
    }
  }
}

/**
 * @deprecated
 */
export function createAngularAbstractControl(
  builder: FormBuilder,
  form?: FormConfigInterface,
  requestClient?: RequestClient
) {
  return form
    ? ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
        builder,
        [...form?.controlConfigs],
        requestClient
      )
    : undefined;
}

/** @description Create angular form group instance from input configurations */
export function createFormGroup(
  builder: FormBuilder,
  inputConfigs?: InputConfigInterface[],
  requestClient?: RequestClient
) {
  return ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
    builder,
    inputConfigs ?? [],
    requestClient
  );
}

/** @description Creates angular form control instance from input configuration */
export function createFormControl(
  builder: FormBuilder,
  inputConfig: InputConfigInterface,
  requestClient?: RequestClient
) {
  return ComponentReactiveFormHelpers.buildControl(
    builder,
    inputConfig,
    requestClient
  );
}

/**
 * Creates angular form control instance from input configuration
 */
export function createFormArray(
  builder: FormBuilder,
  inputConfig: InputConfigInterface
) {
  return ComponentReactiveFormHelpers.buildArray(builder, inputConfig);
}
