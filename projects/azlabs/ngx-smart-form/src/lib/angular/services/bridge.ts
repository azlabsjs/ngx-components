import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import {
  FormConfigInterface,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { ComponentReactiveFormHelpers } from '../helpers';
import { AngularReactiveFormBuilderBridge } from '../types';

@Injectable()
export class ReactiveFormBuilderBrige
  implements AngularReactiveFormBuilderBridge
{
  // Creates and instance of the Angular reactive form bridge
  constructor(public readonly builder: FormBuilder) {}

  group(state: FormConfigInterface | InputConfigInterface[]): AbstractControl {
    if (state) {
      const values = ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
        this.builder,
        !Array.isArray(state)
          ? [...(state as FormConfigInterface).controlConfigs]
          : state
      );
      return values;
    }
    return this.builder.group({});
  }

  control(state: InputConfigInterface) {
    return ComponentReactiveFormHelpers.buildControl(this.builder, state);
  }

  array(state: InputConfigInterface) {
    return ComponentReactiveFormHelpers.buildArray(this.builder, state);
  }
}
