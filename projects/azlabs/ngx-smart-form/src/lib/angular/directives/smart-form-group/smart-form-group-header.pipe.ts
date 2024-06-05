import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'ngxGroupHeader',
})
export class NgxSmartFormGroupHeaderPipe implements PipeTransform {
  // @internal
  // Transform value into an html content if it's not html
  transform(value: string, hidden?: boolean) {
    if (hidden) {
      return '';
    }
    if (/<.+?>/g.test(value)) {
      return value;
    }
    return `<div class="control__group__header">${value}</div>`;
  }
}
