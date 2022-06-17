import { ControlInterface } from "../compact/types";
import { InputConfigInterface } from "../types";
import { InputValidationRule } from "../types/input-rules";
import { buildRequiredIfConfig } from "../helpers/builders";

// @internal
export interface TextAreaInput extends InputConfigInterface {
  cols: number;
  rows: number;
  maxLength: number;
}

/**
 * Creates an instance of the {@see TextAreaInput} interface
 *
 * @param source
 */
export function buildTextAreaInput(source: Partial<ControlInterface>) {
  return {
    label: source.label,
    type: source.type,
    formControlName: source.controlName,
    value: source.value,
    classes: source.classes,
    uniqueCondition: source.uniqueOn,
    isRepeatable: Boolean(source.isRepeatable),
    containerClass: source.dynamicControlContainerClass,
    requiredIf: source.requiredIf
      ? buildRequiredIfConfig(source.requiredIf)
      : undefined,
    formControlIndex: source.controlIndex,
    formControlGroupKey: source.controlGroupKey,
    rules: {
      isRequired: Boolean(source.required),
    } as InputValidationRule,
    placeholder: source.placeholder,
    disabled: Boolean(source.disabled),
    readOnly: Boolean(source.readonly),
    descriptionText: source.description,
    rows: source.rows,
    cols: source.columns,
    maxLength: source.maxLength,
  } as TextAreaInput;
}
