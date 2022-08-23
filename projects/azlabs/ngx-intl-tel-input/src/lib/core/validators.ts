import { AbstractControl } from '@angular/forms';
import { sanitize } from './internal';
import { parsePhoneNumber } from 'awesome-phonenumber';

export class PhoneNumberValidator {
  /**
   * Creates a phone number angular reactive form validator
   *
   * @param control
   */
  static ValidatePhoneNumber(control: AbstractControl) {
    if (control.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && !validator['required']) {
        return null;
      }
    }
    try {
      if (typeof control.value === 'undefined' || control.value === null) {
        return null;
      }
      return !parsePhoneNumber(
        sanitize(String(control.value) as string)
      ).isValid()
        ? { invalidPhoneNumber: true }
        : null;
    } catch (e) {
      return { invalidPhoneNumber: true };
    }
  }
}
