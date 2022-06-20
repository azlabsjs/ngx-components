import { ControlInterface } from '../compact/types';
import { InputConfigInterface } from '../types';

/**
 * Build an instance of the {@see HTMLInput} interface
 *
 * @param source
 * @returns
 */
export function buildHTMLInput(source: Partial<ControlInterface>) {
  return {
    label: source.label,
    type: source.type,
    formControlName: source.controlName,
    value: source.value,
    classes: source.classes,
    isRepeatable: Boolean(source.isRepeatable),
    containerClass: source.containerClass,
    formControlIndex: source.controlIndex,
    formControlGroupKey: source.controlGroupKey,
    descriptionText: source.description,
  } as InputConfigInterface;
}
