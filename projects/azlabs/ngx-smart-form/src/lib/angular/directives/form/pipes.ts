import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  pure: true,
  standalone: true,
  name: 'csshidden',
})
export class HiddenCssClassPipe implements PipeTransform {
  transform(classes: string | string[], hidden: boolean) {
    const values = Array.isArray(classes) ? classes : [classes];

    if (hidden) {
      values.push('hidden');
    }
    return values.join(' ');
  }
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'containercssclass',
})
export class ContainerCssClassPipe implements PipeTransform {
  transform(nogrid: boolean, value: string) {
    return nogrid ? 'ngx-form-no-grid' : value;
  }
}


@Pipe({
  name: 'join',
  standalone: true,
  pure: true
})
export class Join implements PipeTransform {
  transform(character: string, ...args: string[]) {
    args = [...args].filter(arg => typeof arg !== 'undefined' && arg !== null);
    return args.join(character);
  }

}

export const FORM_PIPES = [HiddenCssClassPipe, ContainerCssClassPipe, Join] as const;
