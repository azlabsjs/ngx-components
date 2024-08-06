import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'array',
})
@Injectable({ providedIn: 'any' })
export class ArrayPipe implements PipeTransform {
  /** Returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]) {
    return typeof value === 'undefined' || value === null ? ([] as T[]) : value;
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'isArray',
})
@Injectable({ providedIn: 'any' })
export class IsArrayPipe implements PipeTransform {
  /** Returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]): value is T[] {
    return Array.isArray(value);
  }
}

/** @deprecated Use `length` pipe instead */
@Pipe({
  standalone: true,
  pure: true,
  name: 'arrayLength',
})
@Injectable({ providedIn: 'any' })
export class ArrayLengthPipe implements PipeTransform {
  /** Returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]): number {
    return (value ?? []).length;
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'length',
})
@Injectable({ providedIn: 'any' })
export class LengthPipe implements PipeTransform {
  /** Returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]): number {
    return (value ?? []).length;
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'join',
})
@Injectable({ providedIn: 'any' })
export class JoinPipe implements PipeTransform {
  /**
   * @description Join the list of using the provided character.
   *
   * **Note** By default it uses the `,` to join the elements
   */
  transform(value: unknown[], character = ',') {
    return value.join(character);
  }
}
