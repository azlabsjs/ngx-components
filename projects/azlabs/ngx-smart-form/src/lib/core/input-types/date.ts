import { ControlInterface } from '../compact/types';
import { InputConfigInterface, InputValidationRule } from '../types';
import { buildRequiredIfConfig } from '../helpers/builders';

// @internal
export interface DateInput extends InputConfigInterface {
  minDate: string;
  maxDate: string;
  currentDate: string;
  inputFormat?: string;
}

/**
 * Creates an instance of the {@see DateInput} interface
 *
 * @param source
 */
export function buildDateInput(source: Partial<ControlInterface>) {
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
      maxDate: Boolean(source.maxDate),
      minDate: Boolean(source.minDate),
    } as InputValidationRule,
    placeholder: source.placeholder,
    disabled: Boolean(source.disabled),
    readOnly: Boolean(source.readonly),
    descriptionText: source.description,
    // Date input parts
    minDate: source.minDate,
    maxDate: source.maxDate,
    currentDate: '',
    inputFormat: 'dd/mm/yyyy',
  } as DateInput;
}
