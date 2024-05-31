import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'array',
})
export class ArrayPipe implements PipeTransform {
  /** Returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]) {
    return typeof value === 'undefined' || value === null
      ? ([] as T[])
      : (value as T);
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'isArray',
})
export class IsArrayPipe implements PipeTransform {
  /** Returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]): value is T[] {
    return Array.isArray(value);
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'arrayLength',
})
export class ArrayLengthPipe implements PipeTransform {
  /** Returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]): number {
    return (value ?? []).length;
  }
}
