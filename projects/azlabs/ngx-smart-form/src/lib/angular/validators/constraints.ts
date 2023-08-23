import { Injector } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import {
  createEqualsConstraint,
  createExistsConstraint,
  createPatternConstraint,
  createUniqueConstraint,
  AsyncConstraint,
} from '@azlabsjs/smart-form-core';
import { HTTP_REQUEST_CLIENT } from '../types';
import { from, lastValueFrom } from 'rxjs';

function isDefined(value: unknown): value is AbstractControl {
  return !!value;
}

function restQueryFactory(
  injector: Injector,
  url: string,
  value: unknown,
  query?: string
) {
  return async () => {
    return query
      ? await lastValueFrom(
          from(
            injector.get(HTTP_REQUEST_CLIENT).request(url, 'GET', null, {
              query: { [query]: value },
            })
          )
        )
      : lastValueFrom(
          from(
            injector
              .get(HTTP_REQUEST_CLIENT)
              .request(`${url}/${value}`, 'GET', null)
          )
        );
  };
}

/**
 * Creates an existance validation function
 */
export function existsValidator(
  injector: Injector,
  constraint: AsyncConstraint<boolean>
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    try {
      const { fn, conditions, query } = constraint;
      const _fn =
        typeof fn === 'string'
          ? restQueryFactory(injector, fn, control.value, query)
          : fn;

      // Call the exist constaint on the _fn function
      const _result = await createExistsConstraint(conditions ?? [])(_fn);

      // Returns validation error if _result evaluate to true
      return _result ? null : { exists: control.value };
    } catch (_) {
      return { exists: control.value };
    }
  };
}

/**
 * Creates a unique validation function
 */
export function uniqueValidator(
  injector: Injector,
  constraint: AsyncConstraint<boolean>
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    try {
      const { fn, conditions, query } = constraint;
      const _fn =
        typeof fn === 'string'
          ? restQueryFactory(injector, fn, control.value, query)
          : fn;

      // Call the exist constaint on the _fn function
      const _result = await createUniqueConstraint(conditions ?? [])(_fn);

      // Returns validation error if _result evaluate to true
      return _result ? null : { unique: control.value };
    } catch (_) {
      return null;
    }
  };
}

/**
 * Creates an equals validation function
 */
export function equalsValidator(name: string) {
  return (control: AbstractControl) => {
    const group = control.parent;
    if (!group) {
      return null;
    }
    const _constraint$ = createEqualsConstraint();
    const control2 = group.get(name);

    if (!isDefined(control2)) {
      return null;
    }

    const [value1, value2] = [control.value, control2.value ?? ''];

    console.log('Value 2', value2);

    if (String(value2).trim() === '') {
      return null;
    }

    // Call the constraint on the values
    const _result = _constraint$(value1, value2);

    if (_result) {
      const { errors } = control2;
      // Case the result of the constraint is a truthy value
      // we remove the equals error on the other control
      // To prevent cyclic calls, we first check if the control has an error before
      // updating control value and validity
      if (errors && control2.hasError('equals')) {
        const _errors = (Object.keys(errors) as (keyof typeof errors)[])
          .filter((name) => name !== 'equals')
          .reduce((carry, curr) => {
            carry[curr] = errors[curr];
            return carry;
          }, {} as ValidationErrors);
        control2.setErrors(_errors);
        control2.updateValueAndValidity({ onlySelf: true });
      }
      return null;
    }

    // return the validation result after applying constraint
    return { equals: name };
  };
}

/**
 * Creates a pattern validation function
 */
export function patternValidator(pattern: string) {
  return (control: AbstractControl) => {
    const _constraint$ = createPatternConstraint(pattern);
    const _result = _constraint$(control.value);
    return _result ? null : { pattern };
  };
}
