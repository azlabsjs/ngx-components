import { InputValidationRule } from './input-rules';
import { SelectableControlItems } from './items';

export interface LazyBindingControl {
  serverBindings?: string;
  clientBindings?: string;
}

// @internal
export interface BindingControlInterface
  extends InputInterface,
    LazyBindingControl {
  groupfield: string;
  valuefield: string;
  keyfield: string;
  items: SelectableControlItems;
}

/**
 * @description Abstract representation on an input for plarform specific
 * representation during build type
 *
 * **Note**
 * This interface is subject to change because the package is under active development
 */
export interface InputInterface {
  label: string;
  type: string;
  formControlName: string;
  classes: string;
  requiredIf?: InputRequireIfConfig;
  rules?: InputValidationRule;
  placeholder?: string;
  value?: string | any;
  disabled?: boolean;
  readOnly?: boolean;
  descriptionText?: string;
  formControlGroupKey?: string | number;
  formControlIndex?: number;
  hidden?: boolean;
  isRepeatable: boolean;
  uniqueCondition?: string;
  containerClass: string;
  multiple?: boolean;
}

export interface InputRequireIfConfig {
  formControlName: string;
  values: any[];
}
