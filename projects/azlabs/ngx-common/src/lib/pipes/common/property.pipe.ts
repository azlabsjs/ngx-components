import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { JSObject } from '@azlabsjs/js-object';

/** @description Resolve the value for a given property */
@Pipe({
  pure: true,
  standalone: true,
  name: 'propValue',
})
@Injectable({ providedIn: 'any' })
export class PropertyValuePipe implements PipeTransform {
  transform(
    value: Record<string, unknown> | undefined | null,
    property: string,
    _default: string | undefined | null = ''
  ) {
    return value ? JSObject.getProperty(value, property) ?? _default : _default;
  }
}
