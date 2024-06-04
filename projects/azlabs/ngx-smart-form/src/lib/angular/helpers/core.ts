import { AbstractControl, FormGroup, FormArray } from '@angular/forms';
import {
  InputConfigInterface,
  InputGroup,
  InputRequireIfConfig,
} from '@azlabsjs/smart-form-core';
import { isNumber } from '@azlabsjs/utilities';
import { AngularReactiveFormBuilderBridge, BindingInterface } from '../types';
import { cloneAbstractControl } from './clone';

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
function findAbstractControlParent<TReturn extends FormGroup = FormGroup>(
  g: FormGroup,
  key: string
) {
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
        setValue(g, key, value, i);
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
        const a = new FormArray<AbstractControl<any>>([]);
        for (const current of items) {
          const t = builder.group(leaf) as FormGroup;
          setFormGroupValue(t, current);
          a.push(t);
        }
        g.controls[key] = a;
      } else if (ac instanceof FormArray && Boolean(i?.isRepeatable)) {
        const items = Array.isArray(value) ? value : [];
        const a = new FormArray<AbstractControl<any>>([]);
        for (const current of items) {
          const t = builder.control(i);
          t.setValue(current);
          a.push(t);
        }
        g.controls[key] = a;
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
    try {
      formgroup.controls[key].setValue(value);
    } catch (error) {
      //
    }
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
    // TODO: Provide a way to update array input property as current implementation does not work on array
    inputs = Array.isArray(inputs) ? [...inputs] : [];
    function setProperty(_inputs: InputConfigInterface[], n: string) {
      for (const i of _inputs) {
        // In case the input has children and `b.key` contains `.` character
        // we whish to update the child property of the child
        if (
          (i as InputGroup).children?.length > 0 &&
          n.indexOf('.') !== -1 &&
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
          i.hidden = isHidden(values, v);
          // We find the parent node of the property to update
          // on which .get(), .removeControl() and .addControl() will be called
          const r = findAbstractControlParent(g, b.key);
          if (r === null) {
            return;
          }
          if (i.hidden) {
            const c = r.get(n);
            b.setValueFactory = () => (_g: FormGroup<any>, k: string) => {
              return setPropertyFactory(builder)(_g, k, c?.getRawValue(), i);
            };
            r.removeControl(n);
          } else {
            r.addControl(n, cloneAbstractControl(b.abstractControl));
            const { setValueFactory } = b;
            if (setValueFactory) {
              setValueFactory()(r, n);
            }
          }
        }
      }
    }

    // Call set property on inputs
    setProperty(inputs, b.key);

    // Return the updated g and input properties
    console.log('updated inputs: ', inputs);
    return [g, inputs] as [FormGroup, InputConfigInterface[]];
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

/** @internal Set input properties */
export function setInputsProperties(
  builder: AngularReactiveFormBuilderBridge,
  inputs: InputConfigInterface[],
  b: Map<string, BindingInterface>,
  g: FormGroup,
  v?: any,
  name?: string
) {
  for (const c of b.values()) {
    if (!c.binding) {
      continue;
    }
    if (name && c.binding.name.toString() !== name.toString()) {
      continue;
    }
    const factory = (
      builder: AngularReactiveFormBuilderBridge,
      formgroup: FormGroup
    ) => {
      return setHiddenPropertyFactory(
        inputs ?? [],
        c,
        v ?? c.abstractControl.value
      )(builder, formgroup);
    };
    [g, inputs] = factory(builder, g);
  }

  return [g, inputs] as [FormGroup, InputConfigInterface[]];
}
