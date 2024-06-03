import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'join',
})
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
