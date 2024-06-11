import { Injectable, Pipe, PipeTransform } from '@angular/core';

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
