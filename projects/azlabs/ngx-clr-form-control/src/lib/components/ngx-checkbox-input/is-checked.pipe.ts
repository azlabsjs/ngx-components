import { Pipe, PipeTransform } from '@angular/core';

/** @ionternal */
type ElementType = { value: unknown; checked: boolean };

/** @internal */
function usePredicate(value: unknown) {
  return (el: ElementType) => {
    return el.value === value && el.checked === true;
  };
}

@Pipe({
  standalone: true,
  pure: true,
  name: 'isChecked',
})
export class IsCheckedPipe implements PipeTransform {
  /** @description returns a boolean flag which indicates if value should be marked as checked not not */
  transform(value: unknown, selection: ElementType[]): boolean {
    return selection.findIndex(usePredicate(value)) !== -1;
  }
}
