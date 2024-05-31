import { Pipe, PipeTransform } from '@angular/core';
import { JSObject } from '@azlabsjs/js-object';

/**
 * Resolve the value for a given property
 */
@Pipe({
  pure: true,
  standalone: true,
  name: 'propValue',
})
export class PropertyValuePipe implements PipeTransform {
  // Resolve property value for a given object
  transform(
    value: Record<string, unknown> | undefined | null,
    property: string,
    _default: string | undefined | null = ''
  ) {
    return value ? JSObject.getProperty(value, property) ?? _default : _default;
  }
}
