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

// exported standalone pipes
export const PIPES = [WithConfigValuePipe, ..._PIPES] as const;
