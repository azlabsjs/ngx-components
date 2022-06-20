import { ControlInterface } from '../compact';
import { InputValidationRule } from '../types';
import { setControlOptions } from './bindings';
import { parseControlItemsConfigs } from './parsers';

export function buildRequiredIfConfig(str: string) {
  if (str?.indexOf(':') !== -1) {
    // split the string into the two parts
    const parts = str.split(':');
    let values: any[] = [];
    const result =
      parts[1].indexOf('|') !== -1 ? parts[1].split('|') : [parts[1]];
    result.forEach((part) => {
      const split = part.indexOf(',') !== -1 ? part.split(',') : part;
      values = [...values, ...split];
    });
    return {
      formControlName: parts[0].trim(),
      values,
    };
  }
  return undefined;
}

/**
 * Creates an instance of {@see OptionsInputConfigInterface} interface
 *
 * @param source
 */
export function buildSelectableInput(source: Partial<ControlInterface>) {
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
    multiple: Boolean(source.multiple),
    serverBindings: source.selectableModel,
    clientBindings: source.selectableValues,
  };
  return setControlOptions(input, source.options || []);
}
