import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  pure: true,
  standalone: true,
  name: 'parseInt',
})
@Injectable({ providedIn: 'any' })
export class ParseIntPipe implements PipeTransform {
  // Convert string value to integer
  transform(value: any, radix?: number | undefined) {
    const result = parseInt(value, radix);
    return Number.isNaN(result) ? 0 : result;
  }
}
