import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
    name: 'defined'
})
export class DefinedPipe implements PipeTransform {
  /**
   * Returns true if the provided value is not `undefined` not `null`
   */
  transform(value: unknown) {
    return typeof value !== 'undefined' && value !== null;
  }
}