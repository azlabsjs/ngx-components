import { Pipe, PipeTransform } from '@angular/core';
import { InputConfigInterface, InputTypes } from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'isHidden',
  pure: true,
})
export class IsHiddenPipe implements PipeTransform {
  //
  transform(value: InputConfigInterface) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      (Boolean(value.hidden) === true || value.type === InputTypes.HIDDEN_INPUT)
    );
  }
}
