import { Pipe, PipeTransform } from '@angular/core';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'repeatable',
  pure: true,
})
export class IsRepeatablePipe implements PipeTransform {
  // Execute pipe transform logic
  transform(value: InputConfigInterface) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      Boolean(value.isRepeatable)
    );
  }
}
