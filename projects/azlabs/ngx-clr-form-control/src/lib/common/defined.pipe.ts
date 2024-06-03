import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'defined',
})
export class DefinedPipe implements PipeTransform {
  /** @description Returns true if the provided value is not `undefined` not `null` */
  transform(value: unknown) {
    return typeof value !== 'undefined' && value !== null;
  }
}
