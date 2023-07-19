import { Pipe, PipeTransform } from '@angular/core';
import { InputConfigInterface, NumberInput } from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'numberInput',
})
export class NumberInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as NumberInput;
  }
}
