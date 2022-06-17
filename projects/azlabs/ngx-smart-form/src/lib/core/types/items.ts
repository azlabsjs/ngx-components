/**
 * @description Abstract representation of item in option element, Radio
 * element or Checkbox element on the platform native form
 * element
 */
export interface OptionsInputItem {
  value: any;
  description?: string;
  name: string;
  type: string;
}

// @internal
export interface CheckboxItem extends OptionsInputItem {
  checked?: boolean;
}

// @internal
export interface RadioItem extends OptionsInputItem {
  checked?: boolean;
}

/**
 * @description Union abstraction arround item in option element, Radio
 * element or Checkbox element on the platform native form
 * element
 */
export type OptionsInputItemsInterface = (
  | OptionsInputItem
  | CheckboxItem
  | RadioItem
)[];
