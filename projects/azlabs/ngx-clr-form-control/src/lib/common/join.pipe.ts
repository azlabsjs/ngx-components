import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'join',
})
export class JoinPipe implements PipeTransform {
  /**
   * Join the list of using the provided character.
   *
   * **Note** By default it uses the `,` to join the elements
   */
  transform(value: unknown[], character = ',') {
    return value.join(character);
  }
}
