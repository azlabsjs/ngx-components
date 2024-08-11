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

/** @internal */
type ChangedInputStateType = { name: string; value: boolean }[];

/** @internal */
function findAbstractControlArray<
  TReturn extends AbstractControl = AbstractControl
>(g: AbstractControl, keys: string[]) {
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
  return c as TReturn | null;
}

/** @internal helper function to find the parent of a given abstract control specialy if using . separated property names */
export function findAbstractControlParent<
  TReturn extends FormGroup = FormGroup
>(g: FormGroup, key: string) {
  const keys = key.split('.');
  // Remove the top element of the list of values
  keys.pop();
  return findAbstractControlArray<TReturn>(g, keys);
}

/** @description Search for an abstract control using dot seperated property names  */
export function findAbstractControl<
  TReturn extends AbstractControl = AbstractControl
>(g: FormGroup, key: string) {
  return findAbstractControlArray<TReturn>(g, key.split('.'));
}

/** @internal Set value for formgroup form controls */
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
    setPropertyFactory(builder)(formgroup, key, value, i);
  }
}

/** @description Creates a factory function that set the  */
export function setPropertyFactory(builder: AngularReactiveFormBuilderBridge) {
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
      } else if (
        ac instanceof FormArray &&
        Boolean(i?.isRepeatable) === true &&
        ((i as InputGroup)?.children ?? []).length > 0
      ) {
        const controls = (i as InputGroup)?.children;
        const leaf = Array.isArray(controls)
          ? controls
          : [controls].filter(
              (current) => typeof current !== 'undefined' && current !== null
            );
        const items = Array.isArray(value) ? value : [];
        const a = (g.get(key) as FormArray<any>) ?? new FormArray<any>([]);
        for (const current of items) {
          const t = builder.group(leaf) as FormGroup;
          setFormGroupValue(t, current);
          a.push(t);
        }
        g.setControl(key, a);
      } else if (ac instanceof FormArray && Boolean(i?.isRepeatable)) {
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
  return !_values.includes(value) ? true : false;
}

/** @internal Hidden attribute setter */
export function setHiddenPropertyFactory(
  inputs: InputConfigInterface[],
  b: BindingInterface,
  v: any
) {
  return (builder: AngularReactiveFormBuilderBridge, g: FormGroup) => {
    const changes: ChangedInputStateType = [];
    // TODO: Provide a way to update array input property as current implementation does not work on array
    inputs = Array.isArray(inputs) ? [...inputs] : [];
    function setProperty(_inputs: InputConfigInterface[], n: string) {
      for (const i of _inputs) {
        if (
          (i as InputGroup).children?.length > 0 &&
          // we perform recursive call only if `n` contains `.`
          n.indexOf('.') !== -1 &&
          // we perform recusive call only if n starts with input property name
          n.substring(0, i.name.length) === i.name &&
          // and we perform recursive call only of `n` is not equals to input property name
          n !== i.name
        ) {
          // Continue trimming the binding key until we read the last property name
          // which should be equals to the input name in order to update input
          setProperty(
            (i as InputGroup).children,
            n.split('.').slice(1).join('.')
          );
          // Case `n` matches the input name property
          // we can proceed to input update
        } else if (i.name === n) {
          const values = i.requiredIf?.values ?? [];
          const _previous = i.hidden ?? false;
          i.hidden = isHidden(values, v);
          const _current = i.hidden;
          if (_previous !== _current) {
            changes.push({ name: b.key, value: _current });
          }
          // We find the parent node of the property to update
          // on which .get(), .removeControl() and .addControl() will be called
          const r = findAbstractControlParent(g, b.key);
          if (r === null) {
            return;
          }
          const c = r.get(n);
          if (i.hidden && c) {
            b.setValueFactory = () => (_g: FormGroup<any>, k: string) => {
              return setPropertyFactory(builder)(_g, k, c?.getRawValue(), i);
            };
            r.removeControl(n);
            // Case previous value does not equals current value but the control is not
            // defined, we add the control to the list of form controls
          } else if (_previous !== _current && !c) {
            const result = cloneAbstractControl(b.abstractControl);
            r.addControl(n, result);
            const { setValueFactory } = b;
            if (setValueFactory) {
              setValueFactory()(r, n);
            }
          }
        } else {
        }
      }
    }

    // Call set property on inputs
    setProperty(inputs, b.key);

    // Return the updated g and input properties
    return [g, inputs, changes] as [
      FormGroup,
      InputConfigInterface[],
      ChangedInputStateType
    ];
  };
}

// tslint:disable-next-line: typedef
export function bindingsFactory(inputs: InputConfigInterface[]) {
  return (g: FormGroup) => {
    const b: Map<string, BindingInterface> = new Map();
    if (Array.isArray(inputs) && inputs.length !== 0 && g) {
      // // First we retrieve input config having requiredIf property definition
      const result: { rIf: InputRequireIfConfig; name: string }[] = [];
      function findMatches(values: InputConfigInterface[], parent?: string) {
        for (const v of values) {
          const hasLeaf =
            (v as InputGroup).children && (v as InputGroup).children.length > 0;
          if (hasLeaf) {
            findMatches(
              (v as InputGroup).children,
              parent ? `${parent}.${v.name}` : v.name
            );
          }

          if (v.requiredIf) {
            result.push({
              rIf: v.requiredIf,
              name: parent ? `${parent}.${v.name}` : v.name,
            });
          }
        }
      }

      findMatches(inputs);

      for (const r of result) {
        const { rIf, name } = r;
        const c = findAbstractControl(g, name);
        if (c) {
          b.set(name, {
            key: name,
            binding: rIf,
            abstractControl: c,
            validators: c.validator,
            asyncValidators: c.asyncValidator,
          });
        }
      }
    }
    return b;
  };
}

/** @description Query for an input configuration from the list of input configurations */
export function pickInputConfig(
  inputs: InputConfigInterface[],
  key: string,
  character: string = '.'
) {
  let items = [...inputs];
  const keys = key.split(character);
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

/** @internal Set input properties */
export function setInputsProperties(
  builder: AngularReactiveFormBuilderBridge,
  inputs: InputConfigInterface[],
  b: Map<string, BindingInterface>,
  g: FormGroup,
  v?: any,
  name?: string
) {
  let changes: ChangedInputStateType = [];
  for (const item of b.values()) {
    let c: ChangedInputStateType = [];
    if (!item.binding) {
      continue;
    }
    if (name && item.binding.name.toString() !== name.toString()) {
      continue;
    }
    const factory = (
      builder: AngularReactiveFormBuilderBridge,
      formgroup: FormGroup
    ) => {
      return setHiddenPropertyFactory(
        inputs ?? [],
        item,
        v ?? item.abstractControl.value
      )(builder, formgroup);
    };
    [g, inputs, c] = factory(builder, g);
    changes.push(...c);
  }

  return [g, inputs, changes] as [
    FormGroup,
    InputConfigInterface[],
    ChangedInputStateType
  ];
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
    return carry ? carry.getRawValue() : null;
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

/** @description Query for the value located at a given leaf of the tree of control in an abstract control */
export function pickAbstractControl(
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
  //#region Supported aggregation function
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
  //#region Supported aggregation function

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

/**
 * @description Computes a dependencies trees of input that has their value that needs to be computed
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
      const hasLeaf = ((input as InputGroup)?.children ?? []).length > 0;
      if (hasLeaf) {
        decorated((input as InputGroup).children);
        continue;
      }
      if (input.compute) {
        if (typeof input.compute.fn === 'string') {
          const method = aggregations[input.compute.fn];
          const args = (input.compute as { fn: string; args: string[] }).args;
          const argumentBuilders: ((model: any, params: unknown[]) => void)[] =
            [];
          const deps: string[] = [];
          for (const arg of args) {
            // Case the argument value starts with [ and ends with ], the argument is considered a dependency
            if (String(arg).startsWith('[') && arg.endsWith(']')) {
              const name = arg.slice(1, arg.length - 1);
              // In case we are in presence of a form array value selection
              // the dependency is the form array itself
              const start_index = name.indexOf('*');

              // Due to issue not being able to listen for formgroup control valueChanges event
              // current implementation will listen for entire inner formgroup changes
              // if any is request, and we will use `getObjectProperty` to query for
              // the value of the requested control
              const dot_start_index = name.indexOf('.');
              const after_dot_index = name.slice(dot_start_index + 1);
              const depName =
                start_index !== -1
                  ? name.slice(0, start_index - 1)
                  : dot_start_index !== -1
                  ? name.slice(0, dot_start_index)
                  : name;

              // Push the property on top of dependencies array
              deps.push(depName);

              // Create control property value resolver and push it on top of arguments builder
              const builder =
                start_index !== -1
                  ? (model: any, p: unknown[]) => {
                      const result = getInputValue<unknown[]>(
                        model,
                        name.slice(start_index)
                      );
                      if (result) {
                        p.push(...result);
                      }
                    }
                  : dot_start_index !== -1 && after_dot_index.trim() !== ''
                  ? (model: any, p: unknown[]) => {
                      p.push(getInputValue<unknown>(model, after_dot_index));
                    }
                  : (model: any, p: unknown[]) => {
                      p.push(model);
                    };

              argumentBuilders.push(builder);
            } else {
              argumentBuilders.push((_, p: unknown[]) => {
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
                for (const builder of argumentBuilders) {
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

/** @internal Recursively get errors from an angular reactive control (eg: FormGroup, FormControl, FormArray) */
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
