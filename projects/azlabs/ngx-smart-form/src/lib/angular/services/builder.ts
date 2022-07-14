import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  FormConfigInterface,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { ComponentReactiveFormHelpers } from '../helpers';

/**
 * @deprecated
 */
@Injectable({
  providedIn: 'root',
})
export class DynamicFormBuilder {
  // Creates an instance of the class
  public constructor(private builder: FormBuilder) {}

  public readonly formBuilder = this.builder;

  /**
   * @description Provides a wrapper arround static method for
   * parsing dynamic controls into an angular formgoup
   * @param inputs
   */
  public buildFormGroupFromInputConfig(inputs: InputConfigInterface[]) {
    return ComponentReactiveFormHelpers.buildFormGroupFromInputConfig(
      this.builder,
      inputs
    );
  }

  /**
   * @description From the controls defined in a dynamic form, it controls, and inner embedded dynamic forms,
   * the method returns an Angular form [[FormGroup]] instance
   *
   * @param form
   */
  buildFormGroupFromDynamicForm(form: FormConfigInterface) {
    if (typeof form === 'undefined' || form === null) {
      return undefined;
    }
    const configs = [...(form.controlConfigs as InputConfigInterface[])];
    return this.buildFormGroupFromInputConfig(configs) as FormGroup;
  }
}
