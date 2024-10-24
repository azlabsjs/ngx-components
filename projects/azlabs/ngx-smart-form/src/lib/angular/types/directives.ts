import {
  AbstractControl,
  AsyncValidatorFn,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';
import {
  FormConfigInterface,
  InputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { Observable, ObservableInput } from 'rxjs';

export type ControlsStateMap = {
  [index: string]: { onlySelf: boolean; emitEvent: boolean } | undefined;
};

/**
 * Interface definition for smart form component exposing various
 * method to imperatively interact with component
 */
export interface FormComponentInterface {
  /**
   * Value changes Listener on {@see AbstractControl} using developper
   * provided control name
   *
   * **Note**
   * If control does not exists an Empty observable is returned to caller
   *
   * @param control
   */
  controlValueChanges(control: string): Observable<unknown>;

  /**
   * Reads current value of a given control using the control name.
   *
   * If the control is not found, the default value is provided or an
   * undefined is returned if default value is not passed
   *
   * @param control
   * @param _default
   */
  getControlValue(control: string, _default?: any): unknown;

  /**
   * Set value of a control in it exist in the component formgroup
   *
   * @param control
   * @param value
   */
  setControlValue(control: string, value: any): void;

  /**
   * Disable list on control using a map of configuration
   * for each control to be disabled.
   *
   * @param controls
   */
  disableControls(controls: ControlsStateMap): void;

  /**
   * Enable list on control using a map of configuration
   * for each control to be enabled.
   *
   * @param controls
   */
  enableControls(controls: ControlsStateMap): void;

  /**
   * Add a new control to the internal form group container
   *
   * @param name
   * @param control
   */
  addControl(name: string, control: AbstractControl): void;

  /**
   * Get a control object from the internal form group
   *
   * @param name
   */
  getControl(name: string): AbstractControl | undefined;

  /**
   * Handle submission event of the internal formgroup
   *
   * **Note**
   * Depending on the implementation, developper may decide
   * to internally handle submission an expose an Output that
   * can be bind on an HTML view, or return an observable that the caller may
   * subscribe to.
   *
   * @param event
   */
  onSubmit(event: Event): void | Observable<void> | ObservableInput<void>;

  /**
   * Form value setter function
   *
   * @param value
   */
  setComponentForm(value: FormConfigInterface): void;

  /**
   *
   * @param config
   * @param name
   */
  setControlConfig(config?: InputConfigInterface, name?: string): void;

  /**
   * Call the curren function to validate the internal
   * formgroup object
   */
  validateForm(): void;

  /**
   * Reset the internal state of the form group element
   * removing any validation failure, and modifications
   */
  reset(): void;
}

/**
 * Provides extended interface of the base {@see FormComponentInterface} type for
 * angular reactive form based components
 */
export interface ReactiveFormComponentInterface extends FormComponentInterface {
  /**
   * Internal reactive form component interface
   */
  readonly formGroup: FormGroup;

  /**
   * Set the form group value imperative
   * import {ViewChild, Component, OnInit} from '@angular/core';
   *
   * ```ts
   * @Component({
   *  // ...
   * })
   * export class MyComponent implements OnInit {
   *    @ViewChild('#form', {static: false}) smartform: ReactiveFormComponentInterface;
   *
   *    onFormReadyState(state: unknown) {
   *      setTimeOut(() => {
   *        this.smartform.setValue({ ... })
   *      }, 3000);
   *    }
   * }
   * ```
   *
   * @param state
   */
  setValue(state: { [k: string]: unknown }): void;

  /**
   * Add an async validator to the form group or the a form group control
   *
   * **Note** Case `control` argument is passed as parameter, the component
   * attempt to add an async validation rule to the matching control with name
   */
  addAsyncValidator(validator: AsyncValidatorFn, control?: string): void;

  /**
   * Add a validator to the form group or the a form group control
   *
   * **Note** Case `control` argument is passed as parameter, the component
   * attempt to add the validation rule to the matching control with name
   */
  addValidator(validator: ValidatorFn, control?: string): void;
}
