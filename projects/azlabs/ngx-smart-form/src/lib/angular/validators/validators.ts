import { AbstractControl, ValidatorFn } from '@angular/forms';
import { JSDate } from '@azlabsjs/js-datetime';

export class CustomValidators {
  static match(control: string, other: string) {
    return (group: AbstractControl) => {
      const first = group.get(control)?.value === '' ? undefined : group.get(control)?.value;
      const second = group.get(other)?.value === '' ? undefined : group.get(other)?.value;

      if (
        (typeof first === 'undefined' || first === null) &&
        (typeof second === 'undefined' || second === null)
      ) {
        return null;
      }

      if (first !== second) {
        return { match: true };
      } else {
        return null;
      }
    };
  }

  static url(control: AbstractControl) {
    if (control.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && !validator['required']) {
        return null;
      }
    }

    if (!control.value.startsWith('https') || !control.value.includes('.io')) {
      return { url: true };
    }

    return null;
  }

  static minDate(min: string | Date): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.validator) {
        if (control.value && JSDate.isAfter(min, control.value)) {
          return { min, actual: control.value };
        }
      }
      return null;
    };
  }

  static maxDate(max: string | Date): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.value && JSDate.isBefore(max, control.value)) {
        return { max, actual: control.value };
      }

      return null;
    };
  }

  static numeric(control: AbstractControl) {
    if (control.validator) {
      const validator = control.validator({} as AbstractControl);
      if (validator && !validator['required']) {
        return null;
      }

      const value = parseInt(control.value, 10);
      if (isNaN(value)) {
        return { numeric: true };
      } else {
        return null;
      }
    }
    return null;
  }

  static between(min: number, max: number) {
    return (control: AbstractControl) => {
      if (control.validator && control.value) {
        const validator = control.validator({} as AbstractControl);
        if (validator && !validator['required']) {
          return null;
        }
        if (+control.value >= min && +control.value <= max) {
          return null;
        }
        return { notBetween: true };
      }
      return null;
    };
  }

  static min(min: number) {
    return (control: AbstractControl) => {
      if (control.validator && control.value) {
        const validator = control.validator({} as AbstractControl);
        if (validator && !validator['required']) {
          return null;
        }
        if (+control.value >= min) {
          return null;
        }
        return { min };
      }
      return null;
    };
  }

  static max(max: number) {
    return (control: AbstractControl) => {
      if (control.validator && control.value) {
        const validator = control.validator({} as AbstractControl);
        if (validator && !validator['required']) {
          return null;
        }
        if (+control.value <= max) {
          return null;
        }
        return { max };
      }
      return null;
    };
  }

  static isValidDate(control: AbstractControl) {
    if (control.validator && control.value) {
      let d: Date;

      if (!(control.value instanceof Date) && Date.parse && typeof Date.parse === 'function') {
        d = new Date()
        // Date.parse() will try to convert the string format into a valid date
        d.setTime(Date.parse(control.value))
        // case parsing date fails, we try to treat the date as DD/MM/YYYY or DD-MM-YYYY
        // because javascript does not natively support these date format and will try to parse formats
        // like MM/DD/YYYY or YYYY/MM/DD
        d = isNaN(d.getTime()) ? JSDate.create(String(control.value).replace(/\//g, '-', ), 'DD-MM-YYYY') : d
      } else {
        d = control.value;
      }

      if (isNaN(d.getTime())) {
        return { invalid: { actual: control.value } }
      }
    }
    return null
  }
}
