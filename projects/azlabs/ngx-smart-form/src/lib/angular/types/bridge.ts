import { AbstractControl, FormBuilder } from "@angular/forms";
import { IDynamicForm, InputInterface } from "../../core";

export type Builder = FormBuilder;

export interface AngularReactiveFormBuilderBridge {
  /**
   * @var Builder
   */
  readonly builder: Builder;

  /**
   * @description Create an angular reactive form element from the configuration
   * from dynamic form or list of dynamic inputs
   * @param source
   */
  group(source: IDynamicForm | InputInterface[]): AbstractControl;
}
