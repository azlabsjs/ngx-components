import { ControlGroupInterface, ControlInterface } from '../compact';
import {
  buildRequiredIfConfig,
  buildSelectableInput,
} from '../helpers/builders';
import { buildDateInput } from '../input-types/date';
import { buildFileInput } from '../input-types/file';
import { buildHTMLInput } from '../input-types/header';
import { buildHiddenInput } from '../input-types/hidden';
import { InputGroup } from '../input-types/input-group';
import { buildNumberInput } from '../input-types/number';
import { buildTextInput } from '../input-types/text';
import { buildTextAreaInput } from '../input-types/textarea';
import { InputConfigInterface, InputTypes } from '../types';

type ControlType = Partial<ControlInterface> | Partial<ControlGroupInterface>;

export function buildControl(model: ControlType): InputConfigInterface {
  switch (model.type) {
    case InputTypes.DATE_INPUT:
      return buildDateInput(model);
    case InputTypes.SELECT_INPUT:
      return buildSelectableInput(model);
    case InputTypes.TEXTAREA_INPUT:
      return buildTextAreaInput(model);
    case InputTypes.NUMBER_INPUT:
      return buildNumberInput(model);
    case InputTypes.PHONE_INPUT:
      return buildTextInput(model);
    case InputTypes.PASSWORD_INPUT:
      return buildTextInput(model);
    case InputTypes.CHECKBOX_INPUT:
      return buildSelectableInput(model);
    case InputTypes.RADIO_INPUT:
      return buildSelectableInput(model);
    case InputTypes.EMAIL_INPUT:
      return buildTextInput(model);
    case InputTypes.HIDDEN_INPUT:
      return buildHiddenInput(model);
    case InputTypes.FILE_INPUT:
      return buildFileInput(model);
    case InputTypes.HTML_INPUT:
      return buildHTMLInput(model);
    case InputTypes.CONTROL_GROUP:
      return createInputGroup(model as ControlGroupInterface);
    default:
      return buildTextInput(model);
  }
}

/**
 * Create an {@see InputGroup} type from API data structure
 *
 * This function serves as bridge for transforming server structured
 * control interface into client supported interface
 *
 * ```js
 * const inputGroup = createInputGroup({
 *  // Type definition of the input group
 * }); // Instance of InputGroup
 * ```
 *
 * @param source
 * @returns
 */
export function createInputGroup(source: ControlGroupInterface) {
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
      maxLength: Boolean(source.maxLength),
      minLength: Boolean(source.minLength),
      pattern: Boolean(source.pattern),
    },
    placeholder: source.placeholder,
    disabled: Boolean(source.disabled),
    readOnly: Boolean(source.readonly),
    descriptionText: source.description,
    pattern: source.pattern,
    minLength: source.minLength,
    maxLength: source.maxLength,
    children: source.children.map((current) => buildControl(current)),
  } as InputGroup;
}
