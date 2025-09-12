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

function isDefined(value: unknown): value is AbstractControl {
  return !!value;
}

function createError(constraint: AsyncConstraint, def: string, value: unknown) {
  if ('error' in constraint && constraint.error) {
    return {
      [`custom_${def}`]: { message: constraint.error, params: { value } },
    };
  }
  return { [def]: value };
}

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

  /** error message to be displayed to user whenever validation fails */
  error?: string;
};

/** @internal */
function restQueryFactory(
  client: RequestClient,
  url: string,
  value: unknown,
  query?: string
) {
  return async () => {
    return await lastValueFrom(
      query
        ? from(
            client.request(url, 'GET', null, {
              query: { [query]: value },
            })
          )
        : from(client.request(`${url}/${value}`, 'GET', null))
    );
  };
}

/** creates an existance validation function */
export function existsValidator(
  client: RequestClient,
  constraint: AsyncConstraint<boolean>
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    try {
      const value = control.value;
      const { fn, conditions, query } = constraint;
      const _fn =
        typeof fn === 'string'
          ? restQueryFactory(client, fn, value, query)
          : fn;
      const y =
        typeof conditions === 'function'
          ? (x: unknown) => conditions(x, value)
          : (conditions as string[]);

      const result = await createExistsConstraint(y)(_fn);

      return result ? null : createError(constraint, 'exists', value);
    } catch (_) {
      return createError(constraint, 'exists', control.value);
    }
  };
}

/** creates a unique validation function */
export function uniqueValidator(
  requestClient: RequestClient,
  constraint: AsyncConstraint<boolean>
): AsyncValidatorFn {
  return async (control: AbstractControl) => {
    try {
      const value = control.value;
      const { fn, conditions, query } = constraint;
      const _fn =
        typeof fn === 'string'
          ? restQueryFactory(requestClient, fn, value, query)
          : fn;
      const y =
        typeof conditions === 'function'
          ? (x: unknown) => conditions(x, value)
          : (conditions as string[]);

      const result = await createUniqueConstraint(y ?? [])(_fn);

      return result ? null : createError(constraint, 'unique', value);
    } catch (_) {
      return null;
    }
  };
}

/** creates an equals validation function */
export function equalsValidator(name: string) {
  return (control: AbstractControl) => {
    const group = control.parent;
    if (!group) {
      return null;
    }
    const constraint = createEqualsConstraint();
    const control2 = group.get(name);

    if (!isDefined(control2)) {
      return null;
    }

    const [value1, value2] = [control.value, control2.value ?? ''];

    if (String(value2).trim() === '') {
      return null;
    }

    const result = constraint(value1, value2);
    if (result) {
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

    return { equals: name };
  };
}

/** creates a pattern validation function */
export function patternValidator(pattern: string) {
  return (control: AbstractControl) => {
    const _constraint$ = createPatternConstraint(pattern);
    const _result = _constraint$(control.value);
    return _result ? null : { pattern };
  };
}
