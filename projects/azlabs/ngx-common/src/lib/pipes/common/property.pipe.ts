import { Pipe, PipeTransform } from '@angular/core';

/**
 * Resolve the value for a given property
 */
@Pipe({
  name: 'value',
  pure: true
})
export class PropertyValuePipe implements PipeTransform {
  // Resolve property value for a given object
  transform(
    value: Record<string, unknown> | undefined | null,
    property: string,
    _default: string | undefined | null = ''
  ) {
    if (value) {
      return value[property] ?? _default;
    }
    return _default;
  }
}
