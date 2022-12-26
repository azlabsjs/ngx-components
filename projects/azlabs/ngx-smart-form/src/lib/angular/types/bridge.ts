import { AbstractControl, UntypedFormBuilder } from "@angular/forms";
import { FormConfigInterface, InputConfigInterface } from "@azlabsjs/smart-form-core";

export type Builder = UntypedFormBuilder;

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
  group(source: FormConfigInterface | InputConfigInterface[]): AbstractControl;

  /**
   * Creates a form control instance from form configuration interface
   *
   * @param state
   */
  control(state: InputConfigInterface): AbstractControl;
}
