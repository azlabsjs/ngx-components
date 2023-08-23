import { Injectable, Injector } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import {
  FormConfigInterface,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import {
  createFormGroup,
  createFormArray,
  createFormControl,
} from '../helpers';
import { AngularReactiveFormBuilderBridge } from '../types';

@Injectable()
export class ReactiveFormBuilderBrige
  implements AngularReactiveFormBuilderBridge
{
  get builder() {
    return this.injector.get(FormBuilder);
  }

  /**
   * Class constuctor
   */
  constructor(public readonly injector: Injector) {}

  group(state: FormConfigInterface | InputConfigInterface[]): AbstractControl {
    let inputConfigs = [] as InputConfigInterface[];
    if (state) {
      inputConfigs = !Array.isArray(state)
        ? [...(state as FormConfigInterface).controlConfigs]
        : state;
    }
    const _result = createFormGroup(this.injector, inputConfigs);

    // Return the created form group
    return _result;
  }

  control(state: InputConfigInterface) {
    return createFormControl(this.injector, state);
  }

  array(state: InputConfigInterface) {
    return createFormArray(this.injector, state);
  }
}
