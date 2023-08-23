import { Pipe, PipeTransform } from '@angular/core';
import {
  InputConfigInterface,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'selectInput',
})
export class SelectInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as OptionsInputConfigInterface;
  }
}
