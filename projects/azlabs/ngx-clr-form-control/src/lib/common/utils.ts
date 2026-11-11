import { Pipe, PipeTransform } from '@angular/core';
import { FileInput, InputConfigInterface } from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'accept',
  pure: true,
  standalone: true,
})
export class AcceptFilePipe implements PipeTransform {
  transform(config: FileInput) {
    if (config?.constraints?.pattern?.fn) {
      if (typeof config?.constraints?.pattern?.fn === 'string') {
        return config?.constraints?.pattern?.fn.split(',').map((x) => x.trim());
      }
    }
    return config.constraints && 'pattern' in config.constraints && config.constraints.pattern && config.constraints.pattern.fn ? config.constraints.pattern.fn.split(',').map((x) => x.trim()) : [];
  }
}

@Pipe({
  name: 'required',
  pure: true,
  standalone: true,
})
export class RequiredPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return !!value.constraints && 'required' in value.constraints && !!value.constraints.required;
  }
}


@Pipe({
  standalone: true,
  pure: true,
  name: 'isdisabled'
})
export class IsDisabled implements PipeTransform {
  transform(value: InputConfigInterface) {
    return !!value.constraints && 'disabled' in value.constraints && !!value.constraints.disabled;
  }
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'intmax'
})
export class IntMax implements PipeTransform {
  transform(n0: number) {
    return Math.pow(2, 31) - n0;
  }

}

@Pipe({
  standalone: true,
  pure: true,
  name: 'isObject',
})
export class IsObjectPipe implements PipeTransform {
  /** @description return true if the provided value is a javascript object and is not null*/
  transform(value: unknown) {
    return typeof value === 'object' && value !== null;
  }
}