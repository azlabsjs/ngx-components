import { AbstractControl, ValidatorFn } from '@angular/forms';
import { JSDate } from '@azlabsjs/js-datetime';

/** @internal */
type DateFormat = string | ((value: unknown) => string);


function formatDate(value: unknown, format: DateFormat) {
  if (typeof format === 'function') {
    return format(value);
  }
  return JSDate.format(JSDate.create(String(value)), format)
}

export class CustomValidators {
  private static parseDate(value: Date | string) {
    if (value instanceof Date) {
      return value;
    }

    // use supported date format DD/MM/YYYY or YYYY/MM/DD
    let result = String(value).replace(/\//g, '-');
    let date = result.trim().charAt(4) === '-' ? JSDate.create(result, 'YYYY-MM-DD') : JSDate.create(result, 'DD-MM-YYYY');
    if (!isNaN(date.getTime())) {
      return date;
    }

    // parse date using default javascript Date.parse() for other format specifiers
    date = new Date();
    date.setTime(Date.parse(value));
  
    return date;
  }

  static match(control: string, other: string) {
    return (group: AbstractControl) => {
      const first = group.get(control)?.value === '' ? undefined : group.get(control)?.value;
      const second = group.get(other)?.value === '' ? undefined : group.get(other)?.value;

      if ((typeof first === 'undefined' || first === null) && (typeof second === 'undefined' || second === null)) {
        return null;
      }

      if (first !== second) {
        return { match: true };
      }
      
      return null;
      
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

  static minDate(min: string | Date, format: DateFormat = 'DD/MM/YYYY'): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.validator) {
        if (control.value && JSDate.isAfter(min, CustomValidators.parseDate(control.value))) {
          return { min: { min: formatDate(min, format), actual: control.value } };
        }
      }
      return null;
    };
  }

  static maxDate(max: string | Date, format: DateFormat = 'DD/MM/YYYY'): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.value && JSDate.isBefore(max, CustomValidators.parseDate(control.value))) {
        return { max: { max: formatDate(max, format), actual: control.value } };
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
      }
      
      return null;
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
  
        return { min: { min, actual: control.value } };
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
        return { max: { max, actual: control.value } };
      }
      return null;
    };
  }

  static isValidDate (control: AbstractControl) {
    if (control.validator && control.value) {
      let date: Date;
      if (!(control.value instanceof Date) && Date.parse && typeof Date.parse === 'function') {
        date = CustomValidators.parseDate(control.value);
      } else {
        date = control.value;
      }

      if (isNaN(date.getTime())) {
        return { invalid: { actual: control.value } };
      }
    }
    return null;
  }
}
