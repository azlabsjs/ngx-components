import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'includes',
})
export class IncludesPipe implements PipeTransform {
  /**
   * Checks if the indexOf the provided search exists in the `value` parameter
   */
  transform(value: string | unknown[], search: unknown) {
    return value.indexOf(search as any) !== 1;
  }
}
