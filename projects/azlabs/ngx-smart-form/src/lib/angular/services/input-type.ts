import { Injectable } from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';
import {
  OptionsInputConfigInterface,
  DateInput,
  TextInput,
  TextAreaInput,
  NumberInput,
  FileInput,
  InputConfigInterface,
  TimeInput,
} from '@azlabsjs/smart-form-core';

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
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asSelectInput(
    input?: InputConfigInterface
  ): OptionsInputConfigInterface {
    return input as OptionsInputConfigInterface;
  }
  /**
   * @description Returns a dynamic input configuration as a [[DateInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asDateInput(input?: InputConfigInterface): DateInput {
    return input as DateInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[CheckBoxInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asCheckBoxInput(
    input?: InputConfigInterface
  ): OptionsInputConfigInterface {
    return input as OptionsInputConfigInterface;
  }

  /**
   * @description Returns a dynamic input configuration as a [[RadioInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asRadioInput(
    input?: InputConfigInterface
  ): OptionsInputConfigInterface {
    return input as OptionsInputConfigInterface;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asPasswordInput(input?: InputConfigInterface): TextInput {
    return input as TextInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asTextInput(input?: InputConfigInterface): TextInput {
    return input as TextInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextAreaInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asTextAreaInput(input?: InputConfigInterface): TextAreaInput {
    return input as TextAreaInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[NumberInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asNumberInput(input?: InputConfigInterface): NumberInput {
    return input as NumberInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asEmailInput(input?: InputConfigInterface): TextInput {
    return input as TextInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[FileInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asFileInput(input?: InputConfigInterface): FileInput {
    return input as FileInput;
  }
  /**
   * @description Returns a dynamic input configuration as a [[HTMLInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asHtmlInput(
    input?: InputConfigInterface
  ): OptionsInputConfigInterface {
    return input as OptionsInputConfigInterface;
  }
  /**
   * @description Returns a dynamic input configuration as a [[TextInput]]
   * @param input InputConfigInterface Dynamic input configurations instance
   */
  public asPhoneInput(input?: InputConfigInterface): TextInput {
    return input as TextInput;
  }

  public asTimeInput(input?: InputConfigInterface): TimeInput {
    return input as TimeInput;
  }
}
