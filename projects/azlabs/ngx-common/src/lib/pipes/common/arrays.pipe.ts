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
  name: 'contains',
})
@Injectable({ providedIn: 'any' })
export class ContainsPipe implements PipeTransform {
  transform<T = unknown>(value: T[], arg: T) {
    return value.includes(arg);
  }
}

/** @deprecated use isarray instead */
@Pipe({
  standalone: true,
  pure: true,
  name: 'isArray',
})
@Injectable({ providedIn: 'any' })
export class IsArrayPipe implements PipeTransform {
  /** returns an empty array if the provided value is null or undefined or the value else */
  transform<T>(value: undefined | T[]): value is T[] {
    return Array.isArray(value);
  }
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'isarray',
})
@Injectable({ providedIn: 'any' })
export class IsarrayPipe implements PipeTransform {
  /** returns an empty array if the provided value is null or undefined or the value else */
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
  name: 'concat',
})
@Injectable({ providedIn: 'any' })
export class ConcatPipe implements PipeTransform {
  transform<T>(value: T[], ...args: ConcatArray<T>[]) {
    return value.concat(...args);
  }
}

@Pipe({
  name: 'join',
  standalone: true,
  pure: true,
})
export class JoinPipe implements PipeTransform {
  /**
   * @description Join the list of using the provided character.
   *
   * **Note** By default it uses the `,` to join the elements
   */
  transform<T>(values: T[], separator: string = ' ') {
    return values.join(separator);
  }
}

@Pipe({
  name: 'inarray',
  standalone: true,
  pure: true,
})
export class InArrayPipe implements PipeTransform {
  transform(value: unknown, values: unknown[]) {
    return values.indexOf(value) !== -1;
  }
}

@Pipe({
  name: 'arrayfind',
  standalone: true,
  pure: true,
})
export class ArrayFindPipe implements PipeTransform {
  transform<T = unknown>(values: T[], value: unknown, property?: string) {
    return values.find((item) =>
      property !== null &&
      typeof property !== 'undefined' &&
      typeof item === 'object' &&
      item !== null &&
      property in item
        ? item[property as keyof typeof item] === value
        : item === value
    );
  }
}

@Pipe({
  name: 'arrayfirst',
  standalone: true,
  pure: true,
})
export class ArrayFirstPipe implements PipeTransform {
  transform<T = unknown>(values: T) {
    return Array.isArray(values)
      ? values.length !== 0
        ? values[0]
        : null
      : values;
  }
}

@Pipe({
  name: 'merge',
  standalone: true,
  pure: true,
})
export class MergePipe implements PipeTransform {
  //
  transform<T>(a: any[], ...args: ConcatArray<T>[]) {
    if (!a) {
      return args ?? [];
    }
    return a.concat(args ?? []);
  }
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'asarray',
})
export class AsArrayPipe implements PipeTransform {
  transform(value: unknown) {
    return value as any[];
  }
}
