import {
  AbstractControl,
  AsyncValidatorFn,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CustomValidators } from '../validators';
import {
  OptionsInputConfigInterface,
  CheckboxItem,
  FormConfigInterface,
  InputConfigInterface,
  InputTypes,
} from '../../core';
import {
  DateInput,
  InputGroup,
  NumberInput,
  TextInput,
} from '../../core';
import { tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { JSDate } from '@azlabsjs/js-datetime';

/**
 * @description Helper class for generating angular reactive form controls with errors validation
 */
export class ComponentReactiveFormHelpers {
  /**
   * @description Generate an abstract form control using input configuration
   *
   * @param builder Angular forms reactive formbuilder
   * @param inputs dynamic input configuration
   */
  static buildFormGroupFromInputConfig(
    builder: FormBuilder,
    inputs: (InputConfigInterface | InputGroup)[]
  ) {
    // Build the outer form group
    const group = builder.group({});
    for (const input of inputs) {
      if (input.isRepeatable) {
        group.addControl(input.formControlName, new FormArray([]));
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
            config.children
          );
        if (input?.rules?.isRequired) {
          formgroup.addValidators(Validators.required);
        }
        group.addControl(input.formControlName, formgroup);
        continue;
      }
      group.addControl(
        config.formControlName,
        ComponentReactiveFormHelpers.buildControl(builder, config)
      );
    }
    return group;
  }

  public static buildGroup(builder: FormBuilder, inputs: InputConfigInterface[]) {
    const group = builder.group({});
    for (const config of inputs) {
      if (config.type !== InputTypes.CHECKBOX_INPUT) {
        group.addControl(
          config.formControlName,
          ComponentReactiveFormHelpers.buildControl(builder, config)
        );
      } else {
        group.addControl(
          config.formControlName,
          ComponentReactiveFormHelpers.buildArray(builder, config)
        );
      }
    }
    return group;
  }

  public static buildControl(builder: FormBuilder, config: InputConfigInterface) {
    const validators = [
      config.rules && config.rules.isRequired
        ? Validators.required
        : Validators.nullValidator,
    ];
    const asyncValidators: AsyncValidatorFn[] = [];
    if (
      config.type === InputTypes.TEXT_INPUT ||
      config.type === InputTypes.EMAIL_INPUT ||
      config.type === InputTypes.PASSWORD_INPUT
    ) {
      // Checks if maxlength rule is set to true and apply the rule to the input
      config.rules && config.rules.maxLength
        ? validators.push(
            Validators.maxLength(
              (config as TextInput)?.maxLength
                ? (config as TextInput).maxLength || Math.pow(2, 31) - 1
                : 255
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null,
        // Checks if maxlength rule is set to true and apply the rule to the input
        config.rules && config.rules.minLength
          ? validators.push(
              Validators.minLength(
                (config as TextInput)?.minLength
                  ? (config as TextInput).minLength || 1
                  : 255
              )
            )
          : // tslint:disable-next-line:no-unused-expression
            null;
      config.rules && config.rules.email
        ? validators.push(Validators.email)
        : // tslint:disable-next-line:no-unused-expression
          null;
      config.rules && config.rules.pattern
        ? validators.push(
            Validators.pattern((config as TextInput).pattern || '')
          )
        : // tslint:disable-next-line:no-unused-expression
          null;
    }

    // We add an email validator if the input type is email
    if (config.type === InputTypes.EMAIL_INPUT) {
      validators.push(Validators.email);
    }
    // Check for min an max rules on number inputs and apply validation to the input
    if (config.type === InputTypes.NUMBER_INPUT) {
      config.rules && config.rules.min
        ? validators.push(
            Validators.min(
              (config as NumberInput)?.min ? (config as NumberInput).min : -1
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null,
        // Checks if maxlength rule is set to true and apply the rule to the input
        config.rules && config.rules.max
          ? validators.push(
              Validators.max(
                (config as NumberInput)?.max
                  ? (config as NumberInput).max || Math.pow(2, 31) - 1
                  : Math.pow(2, 31) - 1
              )
            )
          : // tslint:disable-next-line:no-unused-expression
            null;
    }
    // Validation rules form date input
    if (config.type === InputTypes.DATE_INPUT) {
      config.rules && config.rules.minDate
        ? validators.push(
            CustomValidators.minDate(
              (config as DateInput)?.minDate
                ? JSDate.format(
                    (config as DateInput).minDate as string,
                    'YYYY-MM-DD'
                  )
                : JSDate.format(undefined, 'YYYY-MM-DD')
            )
          )
        : // tslint:disable-next-line:no-unused-expression
          null,
        // Checks if maxlength rule is set to true and apply the rule to the input
        config.rules && config.rules.maxDate
          ? validators.push(
              CustomValidators.maxDate(
                (config as DateInput)?.maxDate
                  ? JSDate.format(
                      (config as DateInput).maxDate as string,
                      'YYYY-MM-DD'
                    )
                  : JSDate.format(undefined, 'YYYY-MM-DD')
              )
            )
          : // tslint:disable-next-line:no-unused-expression
            null;
    }
    // Add formControl to the form group with the generated validation rules
    const control = builder.control(
      {
        value: config.value,
        disabled: config.disabled,
      },
      asyncValidators.length > 0 || config.type === InputTypes.DATE_INPUT
        ? {
            validators: Validators.compose(validators),
            updateOn: 'blur',
            asyncValidators,
          }
        : {
            validators: Validators.compose(validators),
          }
    );
    return control;
  }

  public static buildArray(builder: FormBuilder, config: InputConfigInterface) {
    const array = new FormArray<any>([]);
    of((config as OptionsInputConfigInterface).items)
      .pipe(
        tap((items) => {
          (items as any[] as CheckboxItem[]).map(
            (current: CheckboxItem, index: number) => {
              // Added validation rule to checkbox array
              (array as FormArray).push(builder.control(current.checked));
            }
          );
        })
      )
      .subscribe();
    // Add FormArray control to the formGroup
    if (config.rules && config.rules.isRequired) {
      array.setValidators(Validators.required);
    }
    return array;
  }

  public static validateFormGroupFields(control: FormGroup | FormArray): void {
    for (const value of Object.values(control.controls)) {
      if (value instanceof FormGroup || value instanceof FormArray) {
        ComponentReactiveFormHelpers.validateFormGroupFields(value);
      } else {
        ComponentReactiveFormHelpers.markControlAsTouched(value);
      }
    }
  }

  public static markControlAsTouched(
    control?: AbstractControl,
    field?: string
  ): void {
    if (control) {
      control.markAsTouched({ onlySelf: true });
      control.markAsDirty({ onlySelf: true });
      control.markAsPristine({ onlySelf: true });
      control.updateValueAndValidity();
    }
  }

  public static clearControlValidators(control?: AbstractControl): void {
    if (control) {
      control.clearValidators();
      control.updateValueAndValidity();
    }
  }

  public static clearAsyncValidators(control?: AbstractControl): void {
    if (control) {
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

export const createAngularAbstractControl = (
  builder: FormBuilder,
  form?: FormConfigInterface
) => {
  return form
    ? ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(builder, [
        ...form?.controlConfigs,
      ])
    : undefined;
};
