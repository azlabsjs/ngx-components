import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { IDynamicForm, InputInterface } from "../../core";
import { ComponentReactiveFormHelpers } from "../helpers";

/**
 * @deprecated
 */
@Injectable({
  providedIn: "root",
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
  public buildFormGroupFromInputConfig(inputs: InputInterface[]) {
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
  buildFormGroupFromDynamicForm(form: IDynamicForm) {
    if (typeof form === "undefined" || form === null) {
      return undefined;
    }
    const configs = [...(form.controlConfigs as InputInterface[])];
    return this.buildFormGroupFromInputConfig(configs) as FormGroup;
  }
}
