import { FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { isNumber } from '@azlabsjs/utilities';
import { BindingInterface } from '../types';
import { cloneAbstractControl } from './clone';

/** @internal */
type PropertySetterFactory = (
  values: InputConfigInterface[],
  b: BindingInterface,
  value: any
) => (g: FormGroup) => [FormGroup, InputConfigInterface[]];

/** @internal Returns the required if configured values */
function getRequiredIfValues(input: InputConfigInterface) {
  return input.requiredIf?.values ?? [];
}

/** @internal check if the input should be hidden or not */
function shouldHideInput(values: unknown[], value: unknown, _name: string) {
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
  return (g: FormGroup) => {
    const hasControls = Array.isArray(inputs) && inputs.length !== 0;
    if (hasControls) {
      inputs = inputs.map((_input) => {
        if (_input.name === b.key) {
          const values = getRequiredIfValues(_input);
          _input.hidden = shouldHideInput(values, v, _input.name);
          if (_input.hidden) {
            g.removeControl(b.key);
          } else {
            g.addControl(b.key, cloneAbstractControl(b.abstractControl));
          }
        }
        return _input;
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
      for (const v of matches) {
        const { requiredIf, name } = v;
        const c = g.get(name);
        if (c) {
          b.set(name, {
            key: name,
            binding: requiredIf,
            abstractControl: c,
            validators: c?.validator ?? undefined,
            asyncValidators: c?.asyncValidator ?? undefined,
          });
        }
      }
    }
    return b;
  };
}

/** @internal Set input properties */
export function setInputsProperties(
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
    const factory = createControlsPropertiesSetter(
      inputs ?? [],
      c,
      v ?? c.abstractControl.value,
      setHiddenPropertyFactory
    );
    [g, inputs] = factory(g);
  }
  return [g, inputs] as [FormGroup, InputConfigInterface[]];
}

/** @internal */
// tslint:disable-next-line: typedef
export function createControlsPropertiesSetter(
  values: InputConfigInterface[],
  b: BindingInterface,
  v: any,
  callback: PropertySetterFactory
) {
  return (formgroup: FormGroup) => {
    return callback(values, b, v)(formgroup);
  };
}
