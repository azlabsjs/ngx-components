/**
 * @description Control validation rule configuration type definition
 */
export interface InputValidationRule {
  isRequired: boolean;
  maxLength?: boolean;
  minLength?: boolean;
  max?: boolean;
  min?: boolean;
  maxDate?: boolean;
  minDate?: boolean;
  email?: boolean;
  notUnique?: boolean;
  pattern?: boolean;
  same?: boolean;
  invalidFormat?: boolean;
}
