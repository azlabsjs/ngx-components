import { Pipe, PipeTransform } from '@angular/core';

// @internal
type Optional<T> = T | null | undefined;

@Pipe({
  pure: true,
  standalone: true,
  name: 'istable',
})
export class IsTable implements PipeTransform {
  transform(value: Optional<string | string[]>) {
    if (!value) {
      return false;
    }

    const array = Array.isArray(value) ? value : [value];

    return array.includes('table');
  }
}

@Pipe({
  pure: true,
  standalone: true,
  name: 'tableeditmode',
})
export class TableEditMode implements PipeTransform {
  transform(cssClass: Optional<string | string[]>) {

    if (!cssClass) {
      return 'both';
    }

    if (typeof cssClass === 'string') {
      cssClass = cssClass.split(/\s+/);
    }

    const array = (Array.isArray(cssClass) ? cssClass : [cssClass]).map(item => String(item).trim());
    let index = 0;
    let length = array.length;
    const l0 = 'table-edit-mode-'.length;
    const l1 = 'edit-mode-'.length;

    while (index < length) {
      if (array[index] && array[index].substring(0, l0) === 'table-edit-mode-') {
        return array[index].substring(l0).trim() as 'both' | 'inline' | 'modal' | 'none';
      }

      if (array[index] && array[index].substring(0, l1) === 'edit-mode-') {
        return array[index].substring(l1).trim() as 'both' | 'inline' | 'modal' | 'none';
      }

      index += 1;
    }

    return 'both';
  }

}


export const PIPES = [IsTable, TableEditMode] as const;