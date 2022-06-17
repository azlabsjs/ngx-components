import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder } from '@angular/forms';
import { IDynamicForm, InputInterface } from '../../core';
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
  group(source: IDynamicForm | InputInterface[]): AbstractControl {
    if (source) {
      const source_ = !Array.isArray(source)
        ? [...((source as IDynamicForm).controlConfigs as InputInterface[])]
        : (source as InputInterface[]);
      return ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
        this.builder,
        source_
      );
    }
    return this.builder.group({});
  }
}
