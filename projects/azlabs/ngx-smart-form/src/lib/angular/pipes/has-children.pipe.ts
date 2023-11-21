import { Pipe, PipeTransform } from '@angular/core';
import { InputGroup } from '@azlabsjs/smart-form-core';

@Pipe({
  name: 'hasChildren',
  pure: true,
})
export class HasChildrenPipe implements PipeTransform {
  // Execute pipe transform logic
  transform(value: InputGroup) {
    return (
      typeof value !== 'undefined' &&
      value !== null &&
      typeof value.children !== 'undefined' &&
      value.children !== null &&
      Array.isArray(value.children) &&
      value.children.length > 0
    );
  }
}
