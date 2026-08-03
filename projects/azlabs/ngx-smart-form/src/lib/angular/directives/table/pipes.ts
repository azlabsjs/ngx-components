import { Pipe, PipeTransform } from '@angular/core';
import { PIPES as _PIPES } from '../../pipes';
import { InputConfigInterface, InputTypes } from '@azlabsjs/smart-form-core';
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

@Pipe({
  name: 'excludeinput',
  standalone: true,
  pure: true,
})
export class ExcludeInput implements PipeTransform {
  
  transform(value: InputConfigInterface[], name: string | string[]) {
    const names = Array.isArray(name) ? name : [name];
    return [...value].filter(x => names.indexOf(x.type) === -1);
  }
}

// exported standalone pipes
export const PIPES = [WithConfigValuePipe, AppendCssClass, ExcludeInput, ..._PIPES] as const;
