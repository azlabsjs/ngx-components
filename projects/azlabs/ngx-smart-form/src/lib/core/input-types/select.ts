import { ControlInterface } from '../compact/types';
import { InputValidationRule } from '../types';
import { OptionsInputConfigInterface } from '../types';
import { buildRequiredIfConfig } from '../helpers/builders';
import { setControlOptions } from '../helpers/bindings';
import { parseControlItemsConfigs } from '../helpers/parsers';

// @internal
export interface SelectInput extends OptionsInputConfigInterface {
  optionsLabel?: string;
  optionsValueIndex?: string | number;
  multiple?: boolean;
  groupByKey?: string;
}

/**
 * Creates an instance of {@see SelectInput} interface
 *
 * @param source
 */
export function buildSelectInput(source: Partial<ControlInterface>) {
  // Parse the model fields
  let { keyfield, valuefield, groupfield } = source.selectableModel
    ? parseControlItemsConfigs(source)
    : source;
  keyfield = source.keyfield || keyfield;
  valuefield = source.valuefield || valuefield;
  groupfield = source.groupfield || groupfield;
  const input = {
    ...{ keyfield, valuefield, groupfield },
    label: source.label,
    type: source.type,
    formControlName: source.controlName,
    value: source.value,
    classes: source.classes,
    uniqueCondition: source.uniqueOn,
    isRepeatable: Boolean(source.isRepeatable),
    containerClass: source.containerClass,
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
    optionsLabel: 'description',
    groupByKey: 'type',
    optionsValueIndex: 'id',
    multiple: Boolean(source.multiple),
    serverBindings: source.selectableModel,
    clientBindings: source.selectableValues,
  };
  return setControlOptions(input, source.options || []);
}
