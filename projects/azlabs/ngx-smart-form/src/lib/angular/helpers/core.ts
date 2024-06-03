import { AbstractControl, FormGroup, FormArray } from '@angular/forms';
import { InputConfigInterface, InputGroup } from '@azlabsjs/smart-form-core';
import { isNumber } from '@azlabsjs/utilities';
import { AngularReactiveFormBuilderBridge, BindingInterface } from '../types';
import { cloneAbstractControl } from './clone';

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
    const hasControls = Array.isArray(inputs) && inputs.length !== 0;
    const changes: string[] = [];
    if (hasControls) {
      inputs = inputs.map((i) => {
        if (i.name === b.key) {
          const values = i.requiredIf?.values ?? [];
          const _previous = i.hidden;
          i.hidden = isHidden(values, v);
          const _actual = i.hidden;
          if (i.hidden) {
            const c = g.get(b.key);
            b.setValueFactory = () => (g: FormGroup<any>, k: string) => {
              return setPropertyFactory(builder)(g, k, c?.getRawValue(), i);
            };
            g.removeControl(b.key);
          } else {
            g.addControl(b.key, cloneAbstractControl(b.abstractControl));
            const { setValueFactory } = b;
            if (setValueFactory) {
              setValueFactory()(g, b.key);
            }
            // Push property to the list of properties that changes if
            // previous hidden state of the property and the actual
            // hidden state of the element are different
            if (_previous !== _actual) {
              changes.push(b.key);
            }
          }
        }
        return i;
      });
    }
    return [g, inputs] as [FormGroup, InputConfigInterface[]];
  };
}

// tslint:disable-next-line: typedef
export function bindingsFactory(inputs: InputConfigInterface[]) {
  return (g: FormGroup) => {
    const b: Map<string, BindingInterface> = new Map();
    if (Array.isArray(inputs) && inputs.length !== 0 && g) {
      // First we retrieve input config having requiredIf property definition
      const matches = inputs.filter(
        (v) => v.requiredIf !== null && typeof v.requiredIf !== 'undefined'
      );
      // For each matches found, we build the binding map
      for (const i of matches) {
        const { requiredIf, name } = i;
        const c = g.get(name);
        if (c) {
          b.set(name, {
            key: name,
            binding: requiredIf,
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
