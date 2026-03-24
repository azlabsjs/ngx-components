import { Pipe, PipeTransform } from '@angular/core';

// @internal
type Optional<T> = T | null | undefined;

@Pipe({
  pure: true,
  standalone: true,
  name: 'istable',
})
export class TableLayoutPipe implements PipeTransform {
  transform(value: Optional<string|string[]>) {
    if (!value) {
      return false;
    }
    const y = Array.isArray(value) ? value : [value];

    return y.includes('table');
  }
}

// standalone pipes
export const PIPES = [ TableLayoutPipe ] as const;