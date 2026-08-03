import { Pipe, PipeTransform } from '@angular/core';
import { PIPES as _PIPES } from '../../pipes';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { JSObject } from '@azlabsjs/js-object';

@Pipe({
  name: 'withconfigvalue',
  standalone: true,
  pure: true,
})
export class WithConfigValuePipe implements PipeTransform {
  transform(input: InputConfigInterface, state: Record<string, any>) {
    const value = JSObject.getProperty(state, input.name);
    if (value) {
      return { ...input, value };
    }
    return input;
  }
}

@Pipe({
  name: 'appendcss',
  standalone: true,
  pure: true,
})
export class AppendCssClass implements PipeTransform {
  transform(value: InputConfigInterface, cssClass: string) {
    return { ...value, classes: value.classes ? `${value.classes} ${cssClass}` : `${cssClass}` } as InputConfigInterface;
  }
}

// exported standalone pipes
export const PIPES = [WithConfigValuePipe, AppendCssClass, ..._PIPES] as const;
