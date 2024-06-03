import { Pipe, PipeTransform } from '@angular/core';
import {
  InputConfigInterface,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';

@Pipe({
  standalone: true,
  pure: true,
  name: 'selectInput',
})
export class SelectInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as OptionsInputConfigInterface;
  }
}
