import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'parseInt',
  pure: true,
})
export class ParseIntPipe implements PipeTransform {
  // Convert string value to integer
  transform(value: any, radix?: number | undefined) {
    const result = parseInt(value, radix);
    return Number.isNaN(result) ? 0 : result;
  }
}
