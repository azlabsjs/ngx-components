import { Injectable, Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'testPipe',
    standalone: true
})
@Injectable({ providedIn: 'root' })
export class TestPipe implements PipeTransform {
  transform(value: any) {
    return `******${value}******`;
  }
}
