import { AbstractControl, UntypedFormGroup } from '@angular/forms';
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

export function useHiddenAttributeSetter(
  controls: InputConfigInterface[],
  bidings: BindingInterface,
  value: string | number
): CreateControlAttributeSetterReturnType {
  return (formgroup: AbstractControl) => {
    const hasControls = Array.isArray(controls) && controls.length !== 0;
    if (hasControls) {
      controls = controls.map((_control) => {
        if (_control.name === bidings.key) {
          value = isNaN(value as any) ? value : +value;
          const requiredIfValues = isNumber(value)
            ? _control.requiredIf
              ? _control.requiredIf.values.map((value) => {
                  return isNaN(value) ? value : +value;
                })
              : []
            : _control.requiredIf?.values || [];
          _control.hidden = !requiredIfValues.includes(value) ? true : false;
          if (_control.hidden) {
            (formgroup as UntypedFormGroup).removeControl(bidings.key);
          } else {
            (formgroup as UntypedFormGroup).addControl(
              bidings.key,
              cloneAbstractControl(bidings.abstractControl)
            );
          }
        }
        return _control;
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
          formgroup = control as UntypedFormGroup;
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
