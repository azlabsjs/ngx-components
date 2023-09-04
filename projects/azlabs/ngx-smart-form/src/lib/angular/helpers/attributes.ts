import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { isNumber } from '@azlabsjs/utilities';
import { BindingInterface } from '../types';
import { cloneAbstractControl } from './clone';

type CreateControlAttributeSetterReturnType = (
  formgroup: AbstractControl
) => [AbstractControl, InputConfigInterface[]];

type CreateControlAttributeSetterType = (
  controls: InputConfigInterface[],
  bindings: BindingInterface,
  value: any
) => CreateControlAttributeSetterReturnType;

/**
 * @internal Returns the required if configured values
 */
function getRequiredIfValues(input: InputConfigInterface) {
  return input.requiredIf?.values ?? [];
}

/**
 * @internal check if the input should be hidden or not
 */
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
  console.log(values, value, _name);
  const _values = isNumber(value)
    ? values.map((value) =>
        isNaN(value as number) ? value : +(value as string)
      )
    : values || [];
  return !_values.includes(value) ? true : false;
}

/**
 * Hidden attribute setter
 */
export function useHiddenAttributeSetter(
  controls: InputConfigInterface[],
  bidings: BindingInterface,
  value: string | number
): CreateControlAttributeSetterReturnType {
  return (formgroup) => {
    const hasControls = Array.isArray(controls) && controls.length !== 0;
    if (hasControls) {
      controls = controls.map((_input) => {
        if (_input.name === bidings.key) {
          const values = getRequiredIfValues(_input);
          _input.hidden = shouldHideInput(values, value, _input.name);
          if (_input.hidden) {
            (formgroup as FormGroup).removeControl(bidings.key);
          } else {
            (formgroup as FormGroup).addControl(
              bidings.key,
              cloneAbstractControl(bidings.abstractControl)
            );
          }
        }
        return _input;
      });
    }
    return [formgroup, controls];
  };
}

// tslint:disable-next-line: typedef
export function controlAttributesDataBindings(
  controls: InputConfigInterface[]
) {
  return (formgroup: AbstractControl) => {
    const bindings: Map<string, BindingInterface> = new Map();
    if (Array.isArray(controls) && controls.length !== 0 && formgroup) {
      // First we retrieve input config having requiredIf property
      // definition
      const mathes = controls.filter(
        (current) =>
          current.requiredIf !== null &&
          typeof current.requiredIf !== 'undefined'
      );
      // For each matches found, we build the binding map
      for (const config of mathes) {
        const { requiredIf, name } = config;
        const abstractControl = formgroup.get(name);
        if (abstractControl) {
          bindings.set(name, {
            key: name,
            binding: requiredIf,
            abstractControl: abstractControl,
            validators: abstractControl?.validator ?? undefined,
            asyncValidators: abstractControl?.asyncValidator ?? undefined,
          });
        }
      }
      for (const value of bindings.values()) {
        if (value.binding) {
          const [control, _controls] = setControlsAttributes(
            controls,
            value,
            value.abstractControl.value,
            useHiddenAttributeSetter
          )(formgroup);
          formgroup = control as FormGroup;
          controls = _controls;
        }
      }
    }
    return [bindings, formgroup, controls];
  };
}

// tslint:disable-next-line: typedef
export function setControlsAttributes(
  controls: InputConfigInterface[],
  bindings: BindingInterface,
  value: any,
  callback: CreateControlAttributeSetterType
) {
  return (formgroup: AbstractControl) =>
    callback(controls, bindings, value)(formgroup);
}
