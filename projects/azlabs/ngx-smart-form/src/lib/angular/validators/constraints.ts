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
} from '@azlabsjs/smart-form-core';
import { from, lastValueFrom } from 'rxjs';
import { RequestClient } from '../../http';

/** @description async constraint type declaration */
export type AsyncConstraint<T = boolean> = {
  query?: string;
  /**
   * constraint handler function
   */
  fn: string | ((control: string, value: unknown) => T | Promise<T>);
  /**
   * provides the list of conditions applied on properties of the return value of the
   * `fn` function.
   */
  conditions?: string[] | ((result: unknown, source: unknown) => boolean);
};

function isDefined(value: unknown): value is AbstractControl {
  return !!value;
}

/** @internal */
function restQueryFactory(
  requestClient: RequestClient,
  url: string,
  value: unknown,
  query?: string
) {
  return async () => {
    return await lastValueFrom(
      query
        ? from(
            requestClient.request(url, 'GET', null, {
              query: { [query]: value },
            })
          )
        : from(requestClient.request(`${url}/${value}`, 'GET', null))
    );
  };
}

/**
 * creates an existance validation function
 */
export function existsValidator(
  requestClient: RequestClient,
  constraint: AsyncConstraint<boolean>
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    try {
      const _value = control.value;
      const { fn, conditions, query } = constraint;
      const _fn =
        typeof fn === 'string'
          ? restQueryFactory(requestClient, fn, _value, query)
          : fn;
      // Transform the function provided by the developper into one compatible with
      // exists async constraint required type
      const _conditions =
        typeof conditions === 'function'
          ? (value: unknown) => {
              return conditions(value, _value);
            }
          : (conditions as string[]);

      // Call the exist constaint on the _fn function
      const _result = await createExistsConstraint(_conditions)(_fn);

      // Returns validation error if _result evaluate to true
      return _result ? null : { exists: _value };
    } catch (_) {
      return { exists: control.value };
    }
  };
}

/**
 * creates a unique validation function
 */
export function uniqueValidator(
  requestClient: RequestClient,
  constraint: AsyncConstraint<boolean>
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    try {
      const _value = control.value;
      const { fn, conditions, query } = constraint;
      const _fn =
        typeof fn === 'string'
          ? restQueryFactory(requestClient, fn, _value, query)
          : fn;
      // Transform the function provided by the developper into one compatible with
      // exists async constraint required type
      const _conditions =
        typeof conditions === 'function'
          ? (value: unknown) => {
              return conditions(value, _value);
            }
          : (conditions as string[]);

      // Call the exist constaint on the _fn function
      const _result = await createUniqueConstraint(_conditions ?? [])(_fn);

      // Returns validation error if _result evaluate to true
      return _result ? null : { unique: _value };
    } catch (_) {
      return null;
    }
  };
}

/**
 * creates an equals validation function
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
 * creates a pattern validation function
 */
export function patternValidator(pattern: string) {
  return (control: AbstractControl) => {
    const _constraint$ = createPatternConstraint(pattern);
    const _result = _constraint$(control.value);
    return _result ? null : { pattern };
  };
}
