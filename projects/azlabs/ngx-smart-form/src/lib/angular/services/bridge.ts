import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { FormConfigInterface, InputConfigInterface } from '@azlabsjs/smart-form-core';
import { ComponentReactiveFormHelpers } from '../helpers';
import { AngularReactiveFormBuilderBridge } from '../types';

@Injectable()
export class ReactiveFormBuilderBrige
  implements AngularReactiveFormBuilderBridge
{
  // Creates and instance of the Angular reactive form bridge
  constructor(public readonly builder: FormBuilder) {}

  /**
   * Creates a form group based on Input configuration interface of Form configuration Interface
   *
   * @param source
   */
  group(source: FormConfigInterface | InputConfigInterface[]): AbstractControl {
    if (source) {
      const source_ = !Array.isArray(source)
        ? [...((source as FormConfigInterface).controlConfigs as InputConfigInterface[])]
        : (source as InputConfigInterface[]);
      return ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
        this.builder,
        source_
      );
    }
    return this.builder.group({});
  }
}
