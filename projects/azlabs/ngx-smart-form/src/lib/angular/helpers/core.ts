import {
  AbstractControl,
  FormGroup,
  FormArray,
  ValidationErrors,
} from '@angular/forms';
import {
  InputConfigInterface,
  InputGroup,
  InputRequireIfConfig,
} from '@azlabsjs/smart-form-core';
import { isNumber } from '@azlabsjs/utilities';
import {
  AngularReactiveFormBuilderBridge,
  BindingInterface,
  ComputedInputValueConfigType,
} from '../types';
import { cloneAbstractControl } from './clone';
import { Subject } from 'rxjs';

function isinputgroup(input: InputConfigInterface): input is InputGroup {
  return (
    typeof input === 'object' &&
    input !== null &&
    ((input as InputGroup).children ?? []).length > 0
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
        (current) => typeof current !== 'undefined' && current !== null
      );
}

/** @internal */
type ChangedInputStateType = { name: string; value: boolean }[];

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
  key: string
) {
  const keys = key.split('.');
  keys.pop();
  return findarray(g, keys) as T;
}

/** @description search for an abstract control using dot seperated property names  */
export function findcontrol<T extends AbstractControl | null>(
  g: FormGroup,
  key: string
) {
  return findarray(g, key.split('.')) as T;
}

/** @internal set value for formgroup form controls */
export function setFormValue(
  builder: AngularReactiveFormBuilderBridge,
  formgroup: FormGroup,
  values: { [index: string]: any },
  inputs?: InputConfigInterface[] | InputConfigInterface
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
    i: InputConfigInterface
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
          t.setValue(current);
          a.push(t);
        }
        g.setControl(key, a);
      } else {
        g.controls[key]?.setValue(value);
      }
    }
  };
}

/** @internal */
export function setFormGroupValue(
  formgroup: FormGroup,
  values: { [index: string]: any }
) {
  for (const [key, value] of Object.entries(values)) {
    formgroup.controls[key]?.setValue(value);
    formgroup.updateValueAndValidity();
  }
}

/** @internal check if the input should be hidden or not */
function isHidden(values: unknown[], value: unknown) {
  if (values.includes('*')) {
    return !(
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
      typeof value !== 'undefined' &&
      value !== null &&
      String(value).trim() !== ''
    );
  }
  value = isNaN(value as any) ? value : +(value as string);
  const _values = isNumber(value)
    ? values.map((value) =>
        isNaN(value as number) ? value : +(value as string)
      )
    : values || [];
  return !_values.includes(value);
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

function before(haystack: string, char: string) {
  const index = haystack.indexOf(char);
  return index === -1 ? '' : haystack.substring(0, index);
}

function after(haystack: string, char: string) {
  const index = haystack.indexOf(char);
  return index === -1 ? '' : haystack.substring(index + char.length);
}

// tslint:disable-next-line: typedef
export function bindingsFactory(inputs: InputConfigInterface[]) {
  return (g: FormGroup) => {
    const b: Map<string, BindingInterface> = new Map();
    if (Array.isArray(inputs) && inputs.length !== 0 && g) {
      const result: [
        string,
        Omit<InputConfigInterface, 'requiredIf'> & {
          requiredIf: InputRequireIfConfig;
        }
      ][] = [];
      function findmatches(
        values: InputConfigInterface[],
        parent?: string,
        repeatable: boolean = false
      ) {
        for (const v of values) {
          if (hasleaf(v)) {
            const label = parent ? `${parent}.${v.name}` : v.name;
            findmatches(v.children, label, v.isRepeatable ?? false);
          }

          const { requiredIf } = v;
          if (requiredIf) {
            let { name } = v;
            if (parent) {
              name = `${parent}${repeatable ? '.*' : ''}.${v.name}`;
            }
            result.push([name, { ...v, requiredIf }]);
          }
        }
      }

      findmatches(inputs);

      for (const [name, inputConfig] of result) {
        const position = name.indexOf('*');
        const { requiredIf } = inputConfig;
        b.set(name, {
          isdependency: (p) => {
            if (position !== -1) {
              const str = before(requiredIf.name, '*');
              return p.trim().startsWith(str.substring(0, str.length - 1));
            }
            return String(p) === String(requiredIf.name);
          },
          binding: requiredIf,
          dependencyChanged: (
            detached: Map<string, AbstractControl>,
            formgroup: FormGroup,
            property: string,
            value: unknown
          ) => {
            const output: [
              [string, AbstractControl][],
              [string, AbstractControl][]
            ] = [[], []];
            const params = requiredIf.values ?? [];
            // case the selector key contains * and dependecy key starts with selector
            // then the control is the control at the same index having the property after *
            let str = before(name, '*');
            str = str.trim().substring(0, str.length - 1); // str is the name of the parent input property
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
              const dependency = after(requiredIf.name, `${str}.*.`).trim();

              for (let index = 0; index < parent.length; index++) {
                const item = parent.at(index);
                if (!item) {
                  continue;
                }

                let obselete: boolean = false;
                let name: string;
                let control: AbstractControl | undefined | null = null;
                const dep =
                  item instanceof FormGroup
                    ? findcontrol(item, dependency)
                    : null;

                if (item instanceof FormGroup) {
                  control = findcontrol(item, input);
                  name = `${str}.${index}.${input}`;
                  obselete = isHidden(params, dep?.value);
                } else {
                  control = item;
                  name = `${str}.${index}`;
                  obselete = isHidden(params, value);
                }

                // case we cannot select from the formgroup,
                // we try to locate it from the detached controls
                if (!control) {
                  control = detached.get(name);
                }

                // case the control value is not defined, we ignore adding
                // or removing control from detached controls
                if (!control) {
                  continue;
                }

                const found = findparent(formgroup, name);
                const paths = name.split('.');
                const path = paths[paths.length - 1];
                if (!obselete) {
                  // we add the control to the parent if it's missing
                  const control = detached.get(name);
                  if (!found?.get(path) && control) {
                    found?.addControl(path, control);
                    output[0].push([name, control]);
                  }

                  // remove the control from the detached list of controls
                  if (detached.has(name)) {
                    detached.delete(name);
                  }
                } else {
                  // remove the control from the parent if it exists
                  const at = found?.get(path);
                  if (at) {
                    found?.removeControl(path);
                    output[1].push([name, at]);
                  }

                  // if name does not exist in detached, set name value to control
                  if (!detached.has(name)) {
                    detached.set(name, control);
                  }
                }
              }

              // drop out of the condition block and exit from the function
              return output;
            }

            // case we are not handling form array
            let control = findcontrol(g, name);
            const obselete = isHidden(params, value);
            // case we cannot select from the formgroup, we try to locate
            // it from the detached controls
            if (!control) {
              control = detached.get(name) ?? null;
            }

            // case the control value is not defined, we ignore adding
            // or removing control from detached controls
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

            if (!obselete) {
              const control = detached.get(name);
              if (!parent?.get(path) && control) {
                parent?.addControl(path, control);
                output[0].push([name, control]);
              }

              if (detached.has(name)) {
                detached.delete(name);
              }
            } else {
              const at = parent?.get(path);
              if (at) {
                parent?.removeControl(path);
                output[1].push([name, at]);
              }

              if (!detached.has(name)) {
                detached.set(name, control);
              }
            }

            return output;
          },
        });
      }
    }

    return b;
  };
}

/** @description query for an input configuration from the list of input configurations */
export function pickconfig(
  inputs: InputConfigInterface[],
  key: string,
  char: string = '.'
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
  character: string = '.'
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
          getPropertyValue(c, least, character)
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
  character: string = '.'
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
        getInputValue(c, least, character)
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
  character: string = '.'
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
  aggregations: Record<string, (...args: any) => unknown>
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
