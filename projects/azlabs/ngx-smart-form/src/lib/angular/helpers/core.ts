import {
  AbstractControl,
  FormGroup,
  FormArray,
  ValidationErrors,
} from '@angular/forms';
import {
  InputConfigInterface,
  InputGroup,
  Conditional,
  OptionsInput,
  RequiredIfConstraint,
  DisabledIfConstraint,
} from '@azlabsjs/smart-form-core';
import { isNumber } from '@azlabsjs/utilities';
import {
  AngularReactiveFormBuilderBridge,
  Condition,
  ComputedInputValueConfigType,
} from '../types';
import { cloneAbstractControl } from './clone';
import { Observable, Subject, Subscription } from 'rxjs';

/** @internal */
type Optional<T> = T | null | undefined;

function safeSetValue<T = unknown>(
  a: Optional<AbstractControl>,
  value: T,
  logger?: (err: unknown) => void,
) {
  if (!a) {
    return;
  }
  try {
    a.setValue(value);
  } catch (error) {
    if (logger) {
      logger(error);
    }
  }
}

function isformgroup(x: AbstractControl): x is FormGroup {
  return x instanceof FormGroup;
}

function before(haystack: string, char: string) {
  const index = haystack.indexOf(char);
  return index === -1 ? '' : haystack.substring(0, index);
}

function after(haystack: string, char: string) {
  const index = haystack.indexOf(char);
  return index === -1 ? '' : haystack.substring(index + char.length);
}

function isinputgroup(input: InputConfigInterface): input is InputGroup {
  return (
    typeof input === 'object' &&
    input !== null &&
    ((input as InputGroup).children ?? []).length > 0
  );
}

function isoptionsinput(
  config: InputConfigInterface,
): config is Required<OptionsInput> {
  return (
    'optionsConfig' in config &&
    typeof (config as OptionsInput).optionsConfig === 'object' &&
    (config as OptionsInput).optionsConfig !== null
  );
}

function isrepeatablegroup(input: InputConfigInterface): input is InputGroup {
  return isinputgroup(input) && Boolean(input.isRepeatable) === true;
}

function isrepeatableinput(input: InputConfigInterface) {
  return (
    typeof input === 'object' &&
    input !== null &&
    Boolean(input.isRepeatable) === true
  );
}

function getinputgroupinputs(input: InputGroup) {
  const { children } = input;
  return Array.isArray(children)
    ? children
    : [children].filter(
        (current) => typeof current !== 'undefined' && current !== null,
      );
}

/** @internal */
// type ChangedInputStateType = { name: string; value: boolean }[];

/** @internal */
function findarray<T extends AbstractControl>(g: T, keys: string[]) {
  let c: AbstractControl | null = g;
  for (const k of keys) {
    if (c === null) {
      break;
    }

    if (c && (c instanceof FormGroup || c instanceof FormArray)) {
      c = c.get(k) as FormGroup;
    } else {
      // Case c is not a form group instance, that means we do not search
      // further for a control as simply set c to null to stop the iteration
      // and return null
      c = null;
    }
  }
  return c as T | null;
}

/** @internal helper function to find the parent of a given abstract control specialy if using . separated property names */
export function findparent<T extends FormGroup | null>(
  g: FormGroup,
  key: string,
) {
  const keys = key.split('.');
  keys.pop();
  return findarray(g, keys) as T;
}

/** @description search for an abstract control using dot seperated property names  */
export function findcontrol<T extends AbstractControl | null>(
  g: FormGroup,
  key: string,
) {
  return findarray(g, key.split('.')) as T;
}

/** @internal set value for formgroup form controls */
export function setFormValue(
  builder: AngularReactiveFormBuilderBridge,
  formgroup: FormGroup,
  values: { [index: string]: any },
  inputs?: InputConfigInterface[] | InputConfigInterface,
) {
  for (const [key, value] of Object.entries(values)) {
    const i = Array.isArray(inputs)
      ? inputs?.find((config) => config.name === key)
      : inputs;
    if (typeof i === 'undefined' || i === null) {
      continue;
    }
    createSetValue(builder)(formgroup, key, value, i);
  }
}

/** @description creates a factory function that set the  */
export function createSetValue(builder: AngularReactiveFormBuilderBridge) {
  return function setValue(
    g: FormGroup<any>,
    key: string,
    value: any,
    i: InputConfigInterface,
  ) {
    const ac = g.controls[key];
    if (ac && value) {
      if (ac instanceof FormGroup) {
        setFormGroupValue(ac, value);
      } else if (ac instanceof FormArray && isrepeatablegroup(i)) {
        const leaf = getinputgroupinputs(i);
        const items = Array.isArray(value) ? value : [];
        const a = (g.get(key) as FormArray<any>) ?? new FormArray<any>([]);
        for (const current of items) {
          const t = builder.group(leaf);
          setFormGroupValue(t, current);
          a.push(t);
        }
        g.setControl(key, a);
      } else if (ac instanceof FormArray && isrepeatableinput(i)) {
        const items = Array.isArray(value) ? value : [];
        const a = (g.get(key) as FormArray<any>) ?? new FormArray<any>([]);
        for (const current of items) {
          const t = builder.control(i);
          safeSetValue(t, current, console.error);
          a.push(t);
        }
        g.setControl(key, a);
      } else {
        safeSetValue(g.controls[key], value, console.error);
      }
    }
  };
}

/** @internal */
export function setFormGroupValue(
  formgroup: FormGroup,
  values: { [index: string]: any },
) {
  for (const [key, value] of Object.entries(values)) {
    safeSetValue(formgroup.controls[key], value, console.error)
    formgroup.updateValueAndValidity();
  }
}

/** @internal check if the input should matches any of the provided values or conditions */
function matchany(value: unknown, values: unknown[]) {
  if (values.includes('*')) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      String(value).trim() !== ''
    );
  }

  if (
    values.includes('__null__') ||
    values.includes('__undefined__') ||
    values.includes('__empty__')
  ) {
    return (
      typeof value === 'undefined' ||
      value === null ||
      String(value).trim() === ''
    );
  }
  value = isNaN(value as any) ? value : +(value as string);
  const _values = isNumber(value)
    ? values.map((value) =>
        isNaN(value as number) ? value : +(value as string),
      )
    : values || [];

  return _values.includes(value);
}

function hasleaf(input: InputConfigInterface): input is InputGroup {
  const x = input as InputGroup;
  return (
    typeof x === 'object' &&
    'children' in x &&
    x !== null &&
    x.children &&
    x.children.length > 0
  );
}

// @internal conditial properties
const CONDITION_PROPERTIES = ['requiredIf', 'disabledIf'] as const;
type ConditionProperty = (typeof CONDITION_PROPERTIES)[number];
type Nullable<T> = T | undefined | null;
type ClauseFn = (
  control: AbstractControl,
  name: string,
  parent: FormGroup | null,
  path: string,
) => void;

function findconditions(
  inputs: InputConfigInterface[],
  prop: ConditionProperty,
) {
  const conditions: [string, Conditional][] = [];
  function isconditional(
    property: ConditionProperty,
    constraint: InputConfigInterface['constraints'],
  ): constraint is RequiredIfConstraint & DisabledIfConstraint {
    if (!constraint) {
      return false;
    }
    return (
      CONDITION_PROPERTIES.indexOf(property) !== -1 && property in constraint
    );
  }

  function search(
    property: ConditionProperty,
    values: InputConfigInterface[],
    parent?: string,
    repeatable: boolean = false,
  ) {
    for (const v of values) {
      if (hasleaf(v)) {
        const label = parent ? `${parent}.${v.name}` : v.name;
        search(property, v.children, label, v.isRepeatable ?? false);
      }

      let cond: Conditional | undefined | null;
      if (v.constraints) {
        const { constraints } = v;

        cond = isconditional(property, constraints)
          ? (constraints[property] as Conditional)
          : undefined;
      }

      if (!cond) {
        const { [property]: condition } = v;
        cond = condition;
      }

      if (cond) {
        let { name } = v;
        if (parent) {
          name = `${parent}${repeatable ? '.*' : ''}.${v.name}`;
        }
        conditions.push([name, cond]);
      }
    }
  }

  search(prop, inputs);

  return conditions;
}

export function useCondition(
  prop: ConditionProperty,
  then: ClauseFn,
  _else: ClauseFn,
  query?: (name: string) => AbstractControl | null,
) {
  return (inputs: InputConfigInterface[]) => {
    const items: Condition[] = [];
    if (Array.isArray(inputs) && inputs.length !== 0) {
      const conditions = findconditions(inputs, prop);
      for (const [name, condition] of conditions) {
        const position = name.indexOf('*');
        items.push({
          match: (p) => {
            if (position !== -1) {
              const str = before(condition.name, '*');
              return p.trim().startsWith(str.substring(0, str.length - 1));
            }
            return String(p) === String(condition.name);
          },
          dependencyChanged: (
            formgroup: FormGroup,
            property: string,
            value: unknown,
          ) => {
            const output: [
              [string, AbstractControl][],
              [string, AbstractControl][],
            ] = [[], []];
            const params = condition.values ?? [];
            // case the selector key contains * and dependecy key starts with string before `*`
            // then the control is the control at the same index having the property after *
            let str = before(name, '*');
            str = str.trim().substring(0, str.length - 1); // remove the trailing `.` at the end of `str`
            if (position !== -1 && property.trim().startsWith(str)) {
              const parent = findcontrol(formgroup, str) as FormArray;
              if (!parent) {
                return output;
              }

              if (!(parent instanceof FormArray)) {
                throw new Error(`parent at ${str} is not a form array`);
              }

              if (parent.length === 0) {
                return output;
              }

              const input = after(name, `${str}.*.`).trim();
              for (let index = 0; index < parent.length; index++) {
                const item = parent.at(index);
                if (!item) {
                  continue;
                }

                const prefix = `${str}.${index}`;
                let name = isformgroup(item)
                  ? `${prefix}.${input}`
                  : `${prefix}`;
                let control = isformgroup(item)
                  ? findcontrol(item, input)
                  : item;
                let dependency = isformgroup(item)
                  ? findcontrol(item, after(condition.name, `${str}.*.`).trim())
                  : item;

                // case the dependency cannot be located continue to next iteration
                if (!dependency) {
                  continue;
                }

                // case we cannot select from the formgroup,
                // we try to locate it from using the query function
                if (!control && !!query) {
                  control = query(name);
                }

                // case the control value is not defined, we continue with the next iteration
                // as we don't need to handle missing inputs
                if (!control) {
                  continue;
                }

                const truthy = matchany(dependency.value, params);
                const found = findparent(formgroup, name);
                const paths = name.split('.');
                const path = paths[paths.length - 1];
                if (truthy) {
                  then(control, path, found, name);
                  if (control) {
                    output[0].push([name, control]);
                  }
                } else {
                  _else(control, path, found, name);
                  const item = found?.get(path);
                  if (item) {
                    output[1].push([name, item]);
                  }
                }
              }

              // drop out of the condition block and exit from the function
              return output;
            }

            // case we are not handling form array)
            let control = findcontrol(formgroup, name);
            const truthy = matchany(value, params);

            // case we cannot select from the formgroup, we try to locate it using the query function
            if (!control && !!query) {
              control = query(name);
            }

            // case the control value is not defined, we do not proceed any further
            if (!control) {
              return output;
            }

            const index = name.indexOf('.');
            let parent: FormGroup | null;
            let path: string;

            const paths = name.split('.');
            if (index !== -1) {
              path = paths[paths.length - 1];
              parent = findparent(formgroup, name);
            } else {
              path = name;
              parent = formgroup;
            }

            if (truthy) {
              then(control, path, parent, name);
              if (control) {
                output[0].push([name, control]);
              }
            } else {
              _else(control, path, parent, name);
              if (control) {
                output[1].push([name, control]);
              }
            }

            return output;
          },
        });
      }
    }

    return items;
  };
}

/** @description query for an input configuration from the list of input configurations */
export function pickconfig(
  inputs: InputConfigInterface[],
  key: string,
  char: string = '.',
) {
  let items = [...inputs];
  const keys = key.split(char);
  let result: InputConfigInterface | null = null;
  for (const k of keys) {
    const input = items.find((i) => i.name === k);
    if (!input) {
      result = null;
      break;
    }
    items = [...((input as InputGroup).children ?? [])];
    result = input;
  }

  return result;
}

/** @description Query for the value located at a given leaf of the tree of control in an abstract control */
export function getPropertyValue<TReturn = any>(
  model: AbstractControl | null,
  key: string,
  character: string = '.',
): TReturn {
  if (
    key === '' ||
    typeof key === 'undefined' ||
    key === null ||
    typeof model === 'undefined' ||
    model === null
  ) {
    return model?.getRawValue() ?? null;
  }
  character = character ?? '.';
  if (key.includes(character)) {
    const properties = key.split(character);
    let carry: AbstractControl | null = model;

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      if (property === '*' && carry instanceof FormArray) {
        const least = properties.slice(i + 1).join(character);
        return carry.controls.map((c) =>
          getPropertyValue(c, least, character),
        ) as any as TReturn;
      }
      if (carry instanceof FormGroup) {
        carry = carry.get(property);
      }

      if (carry === null) {
        break;
      }
    }
    return carry ? carry.getRawValue() : (null as TReturn);
  }

  return model.get(key)?.getRawValue();
}

export function getInputValue<TReturn = any>(
  v: any,
  key: string,
  character: string = '.',
): TReturn {
  if (
    key === '' ||
    typeof key === 'undefined' ||
    key === null ||
    typeof v !== 'object' ||
    v === null
  ) {
    return v ?? null;
  }

  character = character ?? '.';

  const properties = key.split(character);
  let carry: any | null = v;

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];

    if (property === '*' && Array.isArray(carry)) {
      const least = properties.slice(i + 1).join(character);
      return carry.map((c) =>
        getInputValue(c, least, character),
      ) as any as TReturn;
    }
    if (typeof carry === 'object') {
      carry = carry[property];
    }

    if (carry === null) {
      break;
    }
  }
  return carry ?? null;
}

/** @description query for the value located at a given leaf of the tree of control in an abstract control */
export function pickcontrol(
  model: AbstractControl | null,
  key: string,
  character: string = '.',
): AbstractControl | null {
  if (
    key === '' ||
    typeof key === 'undefined' ||
    key === null ||
    typeof model === 'undefined' ||
    model === null
  ) {
    return model ?? null;
  }
  character = character ?? '.';
  if (key.includes(character)) {
    const properties = key.split(character);
    let carry: AbstractControl | null = cloneAbstractControl(model);

    for (let i = 0; i < properties.length; i++) {
      const property = properties[i];

      if (property === '*' && carry instanceof FormArray) {
        return carry;
      }

      if (carry instanceof FormGroup) {
        carry = carry.get(property.trim());
      }

      if (carry === null) {
        break;
      }
    }
    return carry;
  }

  return model.get(key.trim());
}

/** @internal */
export function useSupportedAggregations() {
  function avg(...args: unknown[]) {
    return sum(...args) / args.length;
  }

  function sum(...args: unknown[]) {
    return args
      .map((v) => Number(v))
      .filter((v) => !isNaN(v))
      .reduce((carry, curr) => {
        carry += curr;
        return carry;
      }, 0);
  }

  function count(...args: unknown[]) {
    return args.length;
  }

  function min(...args: unknown[]) {
    return Math.min(...args.map((v) => Number(v)).filter((v) => !isNaN(v)));
  }

  function max(...args: unknown[]) {
    return Math.max(...args.map((v) => Number(v)).filter((v) => !isNaN(v)));
  }

  function concat(character: string, ...args: unknown[]) {
    return args.map((v) => String(v)).join(character);
  }

  function multiply(...args: unknown[]) {
    if (args.length === 0) {
      return 0;
    }
    return args
      .map((v) => Number(v))
      .map((v) => (!isNaN(v) ? v : 0))
      .reduce((carry, curr) => {
        carry *= curr;
        return carry;
      }, 1);
  }

  function divide(...args: unknown[]) {
    if (args.length === 0) {
      return 0;
    }
    return args
      .slice(1)
      .map((v) => Number(v))
      .map((v) => (!isNaN(v) ? v : 1))
      .reduce((carry, curr) => {
        carry /= curr;
        return carry;
      }, Number(args[0]));
  }

  function substract(...args: unknown[]) {
    if (args.length === 0) {
      return 0;
    }
    return args
      .slice(1)
      .map((v) => Number(v))
      .filter((v) => !isNaN(v))
      .reduce((carry, curr) => {
        carry -= curr;
        return carry;
      }, Number(args[0]));
  }

  const aggregations: Record<string, (...args: any) => unknown> = {
    avg,
    average: avg,
    sum,
    count,
    min,
    max,
    join: concat,
    concat,
    multiply,
    divide,
    substract,
  };

  return aggregations;
}

type ArgsBuilderType = (model: any, params: unknown[]) => void;

/**
 * computes a dependencies trees of input that has their value that needs to be computed
 * based on other input value or provided raw values
 */
export function createComputableDepencies(
  items: InputConfigInterface[],
  aggregations: Record<string, (...args: any) => unknown>,
) {
  const dependencies: {
    [prop: string]: ComputedInputValueConfigType<any>;
  } = {};
  const inputs = [...items];

  const decorated = (values: InputConfigInterface[]) => {
    for (const input of values) {
      if (hasleaf(input)) {
        decorated(input.children);
        continue;
      }

      if (input.compute) {
        if (typeof input.compute.fn === 'string') {
          const method = aggregations[input.compute.fn];
          const args = (input.compute as { fn: string; args: string[] }).args;
          const argbuilders: ArgsBuilderType[] = [];
          const deps: string[] = [];
          for (const arg of args) {
            // case the argument value starts with [ and ends with ], the argument is considered a dependency
            if (String(arg).startsWith('[') && arg.endsWith(']')) {
              const name = arg.slice(1, arg.length - 1);
              // case we are in presence of a form array value selection
              // the dependency is the form array itself
              const star_index = name.indexOf('*');

              // due to issue not being able to listen for formgroup control valueChanges event
              // current implementation will listen for entire inner formgroup changes
              // if any is request, and we will use `getObjectProperty` to query for
              // the value of the requested control
              const dot_index = name.indexOf('.');
              const after_dot = name.slice(dot_index + 1);
              const depName =
                star_index !== -1
                  ? name.slice(0, star_index - 1)
                  : dot_index !== -1
                    ? name.slice(0, dot_index)
                    : name;

              // push the property on top of dependencies array
              deps.push(depName);
              // create control property value resolver and push it on top of arguments builder
              let builder: ArgsBuilderType;

              if (star_index !== -1) {
                builder = (model: any, stack: unknown[]) => {
                  const result =
                    getInputValue<unknown[]>(model, name.slice(star_index)) ??
                    [];
                  if (result) {
                    stack.push(...result);
                  }
                };
              } else if (dot_index !== -1 && after_dot.trim() !== '') {
                builder = (model: any, stack: unknown[]) => {
                  stack.push(getInputValue<unknown>(model, after_dot));
                };
              } else {
                builder = (model: any, stack: unknown[]) => {
                  stack.push(model);
                };
              }

              argbuilders.push(builder);
            } else {
              argbuilders.push((_, p: unknown[]) => {
                p.push(arg);
              });
            }
          }

          for (const dep of deps) {
            const current = dependencies[dep] ?? {
              values: [],
              cancel: new Subject<void>(),
            };
            const values = current.values ?? [];
            values.push({
              name: input.name,
              fn: (model: any) => {
                const stack: unknown[] = [];
                for (const builder of argbuilders) {
                  builder(model, stack);
                }
                return method(...stack);
              },
            });
            dependencies[dep] = {
              values,
              cancel: current.cancel ?? new Subject<void>(),
            };
          }
        } else {
          const compute = input.compute as {
            fn: (model: any) => unknown;
            deps: string[];
          };
          for (const dep of compute.deps) {
            const current = dependencies[dep] ?? {
              values: [],
              cancel: new Subject<void>(),
            };
            const values = current.values ?? [];
            values.push({
              name: input.name,
              fn: compute.fn,
            });
            dependencies[dep] = {
              values,
              cancel: current.cancel ?? new Subject<void>(),
            };
          }
        }
      }
    }
  };

  // Call the decorated function on the provided inputs
  decorated(inputs);

  // Return the builded dependencies
  return dependencies;
}

/** @internal recursively get errors from an angular reactive control (eg: FormGroup, FormControl, FormArray) */
export function collectErrors(control: AbstractControl) {
  const errors: ValidationErrors[] = [];
  const getErrors = (c: AbstractControl, _name?: string) => {
    if (c instanceof FormGroup) {
      for (const name of Object.keys(c.controls)) {
        const current = c.get(name);
        if (current) {
          getErrors(current, name);
        }
      }
    } else if (c instanceof FormArray) {
      for (const _c of c.controls) {
        getErrors(_c);
      }
    } else {
      if (c.invalid && c.errors) {
        errors.push(c.errors);
      }
    }
  };

  getErrors(control);

  // Return the list of error from the control element
  return errors;
}

export function flatteninputs(formgroup: FormGroup) {
  const names: [string, AbstractControl][] = [];
  function resolve(formgroup: FormGroup, root: string = '') {
    for (const [n, control] of Object.entries(formgroup.controls)) {
      if (!control) {
        continue;
      }

      if (control instanceof FormGroup) {
        resolve(control, root.trim() !== '' ? `${root}.${n}` : String(n));
        continue;
      }

      const name = root.trim() !== '' ? `${root}.${n}` : String(n);
      names.push([name, control]);
    }
  }

  resolve(formgroup);

  return names;
}

/** @internal */
export function withRefetchObservable(
  inputs: InputConfigInterface[],
  formgroup: FormGroup,
): InputConfigInterface[] {
  for (const input of inputs) {
    if (isinputgroup(input)) {
      input.children = withRefetchObservable(input.children, formgroup);
    }

    if (
      isoptionsinput(input) &&
      'refetch' in input.optionsConfig &&
      Array.isArray(input.optionsConfig['refetch'])
    ) {
      const { refetch } = input.optionsConfig;
      input.optionsConfig.refetch = new Observable((subscriber) => {
        const subscriptions: Subscription[] = [];
        for (const item of refetch) {
          // TODO: figure out how to subscribe to blur event
          const { trigger, query } = item;
          const { input: name, event: _ } =
            typeof trigger === 'object' && trigger !== null
              ? trigger
              : { input: trigger, event: 'change' };

          if (name.indexOf('*') !== -1) {
            // we must listen for changes on a formarray
            const str = before(name, '*');
            const str2 = after(name, '*').substring(1);
            const array: FormArray | null = findcontrol(
              formgroup,
              str.substring(0, str.length - 1),
            );

            if (array instanceof FormArray) {
              const len = array.length;
              for (let i = 0; i < len; i++) {
                const at = array.at(i);
                const c =
                  str2.trim() !== '' && at instanceof FormGroup
                    ? findcontrol(at, str2)
                    : at;

                if (c && query) {
                  const subscription = c.valueChanges.subscribe((value) => {
                    subscriber.next(value ? { [query]: value } : {});
                  });

                  subscriptions.push(subscription);
                }
              }
            }
          } else {
            const c = findcontrol(formgroup, name);
            const q = query ?? name;
            if (c && query) {
              const subscription = c.valueChanges.subscribe((value) => {
                subscriber.next(value ? { [q]: value } : {});
              });

              subscriptions.push(subscription);
            }
          }
        }

        return () => {
          for (const subscription of subscriptions) {
            subscription?.unsubscribe();
          }
        };
      });
    }
  }

  return inputs;
}
