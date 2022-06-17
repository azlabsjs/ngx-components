import { ControlInterface } from '../compact/types';
import { buildRequiredIfConfig } from '../helpers/builders';
import { InputInterface, InputValidationRule } from '../types';

// @internal
export interface FileInput extends InputInterface {
  uploadUrl?: string;
  pattern?: string;
  multiple: boolean;
  maxFileSize: number;
}

/**
 * Creates an instance of {@see FileInput} interface
 *
 * @param source
 */
export function buildFileInput(source: Partial<ControlInterface>) {
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
    uploadUrl: source.uploadURL,
    pattern: source.pattern,
    multiple: Boolean(source.multiple),
    maxFileSize: source.max ? source.max : null,
  } as FileInput;
}
