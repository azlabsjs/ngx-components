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

export const FORM_PIPES = [HiddenCssClassPipe, ContainerCssClassPipe] as const;
