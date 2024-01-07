import { Pipe, PipeTransform } from '@angular/core';

/**
 * @internal
 */
type PipeResultType<T> = { value: T };

@Pipe({
  name: 'pipeResult',
  pure: true,
})
export class PipeResultPipe implements PipeTransform {
  // Wrap the value into an object to allow UI to use the value with *ngIf
  // in HTML template
  transform<T = any>(value: T) {
    return { value } as PipeResultType<T>;
  }
}
