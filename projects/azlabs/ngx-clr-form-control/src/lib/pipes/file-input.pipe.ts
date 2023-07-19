import { Pipe, PipeTransform } from '@angular/core';
import { FileInput, InputConfigInterface } from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'fileInput',
})
export class FileInputPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return value as FileInput;
  }
}
