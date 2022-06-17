import { AbstractControl } from '@angular/forms';
import * as _ from 'google-libphonenumber';
import { sanitize } from './internal';

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
    const googlePhonelibInstance = _.PhoneNumberUtil.getInstance();
    try {
      let threatedInput: string;
      if (typeof control.value === 'undefined' || control.value === null) {
        return null;
      }
      if (
        !googlePhonelibInstance.isValidNumber(
          googlePhonelibInstance.parseAndKeepRawInput(
            sanitize(String(control.value) as string)
          )
        )
      ) {
        return { invalidPhoneNumber: true };
      }
      return null;
    } catch (e) {
      return { invalidPhoneNumber: true };
    }
  }
}
