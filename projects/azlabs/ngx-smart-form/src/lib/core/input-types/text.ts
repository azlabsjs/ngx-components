import { ControlInterface } from '../compact/types';
import { InputConfigInterface, InputValidationRule, InputTypes } from '../types';
import { buildRequiredIfConfig } from '../helpers/builders';

// @internal
export interface TextInput extends InputConfigInterface {
  maxLength?: number;
  pattern?: string;
  minLength?: number;
}

/**
 * Creates an instance of {@see TextInput} interface
 *
 * @param source
 */
export function buildTextInput(source: Partial<ControlInterface>) {
  return {
    label: source.label,
    type: source.type,
    formControlName: source.controlName,
    value: source.value,
    classes: source.classes,
    uniqueCondition: source.uniqueOn,
    isRepeatable: Boolean(source.isRepeatable) ? true : false,
    containerClass: source.dynamicControlContainerClass,
    requiredIf: source.requiredIf
      ? source.requiredIf
        ? buildRequiredIfConfig(source.requiredIf)
        : undefined
      : undefined,
    formControlIndex: source.controlIndex,
    formControlGroupKey: source.controlGroupKey,
    rules: {
      isRequired: Boolean(source.required) ? true : false,
      maxLength: source.maxLength ? true : false,
      minLength: source.minLength ? true : false,
      email: source.type === InputTypes.EMAIL_INPUT ? true : false,
      notUnique: Boolean(source.unique) ? true : false,
      pattern: source.pattern ? true : false,
    } as InputValidationRule,
    placeholder: source.placeholder,
    disabled: Boolean(source.disabled) ? true : false,
    readOnly: Boolean(source.readonly) ? true : false,
    descriptionText: source.description,
    pattern: source.pattern,
    minLength: source.minLength,
    maxLength: source.maxLength,
  } as TextInput;
}
