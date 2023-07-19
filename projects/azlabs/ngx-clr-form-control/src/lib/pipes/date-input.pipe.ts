import { Pipe, PipeTransform } from '@angular/core';
import {
  InputConfigInterface,
  DateInput,
} from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'dateInput',
})
export class DateInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as DateInput;
  }
}
