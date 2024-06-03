import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'isObject',
})
export class IsObjectPipe implements PipeTransform {
  /** @description Returns true if the provided value is a javascript object and is not null*/
  transform(value: unknown) {
    return typeof value === 'object' && value !== null;
  }
}
