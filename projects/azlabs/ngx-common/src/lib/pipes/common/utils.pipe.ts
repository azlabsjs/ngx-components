import { Injectable, Pipe, PipeTransform } from '@angular/core';

// TODO: Uncomment the code below to use custom implementation instead of implementation from angular
// /** @description Checks if a provided value is a promise or not */
// function isPromise<T>(a: unknown): a is Promise<T> {
//   return (
//     typeof a === 'object' &&
//     a !== null &&
//     typeof (a as Promise<T>).then === 'function' &&
//     typeof (a as Promise<T>).catch === 'function'
//   );
// }

@Pipe({
  standalone: true,
  pure: true,
  name: 'defined',
})
@Injectable({ providedIn: 'any' })
export class DefinedPipe implements PipeTransform {
  /** @description Returns true if the provided value is not `undefined` not `null` */
  transform(value: unknown) {
    return typeof value !== 'undefined' && value !== null;
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'includes',
})
@Injectable({ providedIn: 'any' })
export class IncludesPipe implements PipeTransform {
  /** @description Checks if the indexOf the provided search exists in the `value` parameter */
  transform(value: string | unknown[], search: unknown) {
    return value.indexOf(search as any) !== -1;
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'indexOf',
})
@Injectable({ providedIn: 'any' })
export class IndexOfPipe implements PipeTransform {
  /** @description returns the index of the search parameter in the collection data type */
  transform(value: string | unknown[], search: unknown) {
    return value.indexOf(search as any);
  }
}

@Pipe({
  standalone: true,
  name: 'asAny',
  pure: true,
})
@Injectable({ providedIn: 'any' })
export class AsAnyPipe implements PipeTransform {
  // Cast the provided value as any
  transform(value: unknown) {
    return value as any;
  }
}

@Pipe({
  name: 'keys',
  pure: true,
  standalone: true,
})
export class KeysPipe implements PipeTransform {
  transform(value: { [prop: string]: unknown }) {
    return Object.keys(value);
  }
}
