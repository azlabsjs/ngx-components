import { Pipe, PipeTransform } from '@angular/core';
import { InputConfigInterface, TextAreaInput } from '@azlabsjs/smart-form-core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'textAreaInput',
})
export class TextAreaInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as TextAreaInput;
  }
}
