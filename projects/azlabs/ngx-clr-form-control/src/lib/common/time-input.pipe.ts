import { Pipe, PipeTransform } from '@angular/core';
import {
  InputConfigInterface,
  TimeInput,
} from '@azlabsjs/smart-form-core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'timeInput',
})
export class TimeInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as TimeInput;
  }
}
