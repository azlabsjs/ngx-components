import { Pipe, PipeTransform } from '@angular/core';
import {
  InputConfigInterface,
  TextInput,
} from '@azlabsjs/smart-form-core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'textInput',
})
export class TextInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as TextInput;
  }
}
