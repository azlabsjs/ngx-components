import { Pipe, PipeTransform } from '@angular/core';
import { OptionsInputConfigInterface } from '@azlabsjs/smart-form-core';

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
  transform(value: unknown, selection: ElementType[]): boolean {
    return selection.findIndex(usePredicate(value)) !== -1;
  }
}

@Pipe({
  name: 'hasoptions',
  pure: true,
  standalone: true,
})
export class HasOptionsPipe implements PipeTransform {
  transform(config: OptionsInputConfigInterface) {
    return config.options && config.options.length > 0;
  }
}

// exported standalone pipes
export const PIPES = [IsCheckedPipe, HasOptionsPipe] as const;
