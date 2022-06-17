import { Injectable } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';
import {
  SelectInput,
  DateInput,
  TextInput,
  TextAreaInput,
  NumberInput,
  FileInput,
  InputInterface,
} from '../../core';
import { BindingControlInterface } from '../../core/types';

@Injectable({
  providedIn: 'root',
})
export class InputTypeHelper {
  /**
   * @description Return an abstract control as angular {@see FormArray}
   * @param control
   */
  public asFormArray(control?: AbstractControl): FormArray {
    return control as FormArray;
  }

  /**
   * @description Returns a dynamic input configuration as a [[SelectInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asSelectInput(input?: InputInterface): SelectInput {
    return input as SelectInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[DateInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asDateInput(input?: InputInterface): DateInput {
    return input as DateInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[CheckBoxInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asCheckBoxInput(input?: InputInterface): BindingControlInterface {
    return input as BindingControlInterface;
  }

  /**
   * @description Returns a dynamic input configuration as a [[RadioInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asRadioInput(input?: InputInterface): BindingControlInterface {
    return input as BindingControlInterface;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asPasswordInput(input?: InputInterface): TextInput {
    return input as TextInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asTextInput(input?: InputInterface): TextInput {
    return input as TextInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextAreaInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asTextAreaInput(input?: InputInterface): TextAreaInput {
    return input as TextAreaInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[NumberInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asNumberInput(input?: InputInterface): NumberInput {
    return input as NumberInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asEmailInput(input?: InputInterface): TextInput {
    return input as TextInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[FileInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asFileInput(input?: InputInterface): FileInput {
    return input as FileInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[HTMLInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asHtmlInput(input?: InputInterface): BindingControlInterface {
    return input as BindingControlInterface;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputInterface Dynamic input configurations instance
   */
  public asPhoneInput(input?: InputInterface): TextInput {
    return input as TextInput;
  }
}
