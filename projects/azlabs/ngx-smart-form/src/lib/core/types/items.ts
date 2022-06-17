
/**
 * @description Abstract representation of item in option element, Radio
 * element or Checkbox element on the platform native form
 * element
 */
export interface SelectSourceInterface {
  value: any;
  description?: string;
  name: string;
  type: string;
}

// @internal
export interface CheckboxItem extends SelectSourceInterface {
  checked?: boolean;
}

// @internal
export interface RadioItem extends SelectSourceInterface {
  checked?: boolean;
}

/**
 * @description Union abstraction arround item in option element, Radio
 * element or Checkbox element on the platform native form
 * element
 */
export type SelectableControlItems = Array<
  SelectSourceInterface | CheckboxItem | RadioItem
>;
