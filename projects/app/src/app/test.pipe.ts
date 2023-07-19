import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'testPipe',
})
@Injectable()
export class TestPipe implements PipeTransform {
  transform(value: any) {
    return `******${value}******`;
  }
}
