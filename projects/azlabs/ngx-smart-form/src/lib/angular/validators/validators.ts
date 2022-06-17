import { AbstractControl, ValidatorFn } from '@angular/forms';
import { JSDate } from '@iazlabs/js-datetime';

export class CustomValidators {
  static match(control: string, other: string) {
    return (controlGroup: AbstractControl) => {
      const first =
        controlGroup.get(control)?.value === ''
          ? undefined
          : controlGroup.get(control)?.value;
      const second =
        controlGroup.get(other)?.value === ''
          ? undefined
          : controlGroup.get(other)?.value;
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

  static minDate(minDate: string | Date): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.validator) {
        if (control.value && JSDate.isAfter(minDate, control.value)) {
          return { minDate };
        }
      }
      return null;
    };
  }

  static maxDate(maxDate: string | Date): ValidatorFn {
    return (control: AbstractControl) => {
      if (control.validator) {
        if (control.value && JSDate.isBefore(maxDate, control.value)) {
          return { maxDate };
        }
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
}
