import { Pipe, PipeTransform } from '@angular/core';
import { defaultStrings } from '../constants';

/** @internal */
type ErrorsType = { [prop: string]: any };

/** @internal */
const DEFAULT_ERRORS = Object.keys(defaultStrings.validation);

@Pipe({
  pure: true,
  standalone: true,
  name: 'customErrors',
})
export class CustomErrorsPipe implements PipeTransform {
  /** @description returns custom errors from the provided list of errors */
  transform(errors: ErrorsType | null) {
    return errors
      ? Object.keys(errors)
          .filter((v) => DEFAULT_ERRORS.indexOf(v) === -1)
          .map((curr) => {
            return errors[curr];
          })
      : [];
  }
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'supportedErrors',
})
export class ErrorsPipe implements PipeTransform {
  /** @description resolve the list of errors that are predefined in  the library */
  transform(errors: ErrorsType | null) {
    return errors ? DEFAULT_ERRORS.filter((v) => !!errors[v]) : [];
  }
}
