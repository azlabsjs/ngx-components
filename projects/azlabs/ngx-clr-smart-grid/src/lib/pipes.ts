import { Pipe, PipeTransform } from '@angular/core';
import { GridConfigType } from './core';

@Pipe({
  name: 'gridRowClass',
  pure: true,
  standalone: true,
})
export class GridRowClassPipe implements PipeTransform {
  /** resolve row class based on provided data */
  transform(config: GridConfigType, current: { [index: string]: any }) {
    return config && config.projectRowClass
      ? typeof config.projectRowClass === 'function'
        ? config.projectRowClass(current)
        : config.projectRowClass
      : '';
  }
}
