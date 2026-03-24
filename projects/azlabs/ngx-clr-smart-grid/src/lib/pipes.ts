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

@Pipe({
  name: 'cssclass',
  pure: true,
  standalone: true,
})
export class CellClassPipe implements PipeTransform {
  transform(
    value:
      | string
      | string[]
      | ((value: unknown, model: Record<string, unknown>) => string)
      | undefined,
    p: unknown,
    model: Record<string, unknown>
  ) {
    return typeof value === 'function' ? value(p, model) : value ?? '';
  }
}

@Pipe({
  name: 'cssstyle',
  pure: true,
  standalone: true,
})
export class CellStylePipe implements PipeTransform {
  transform(
    value:
      | string
      | string[]
      | ((value: unknown, model: Record<string, unknown>) => string)
      | undefined,
    p: unknown,
    model: Record<string, unknown>
  ) {
    return typeof value === 'function' ? value(p, model) : value ?? '';
  }
}

// exported standalone pipes
export const PIPES = [GridRowClassPipe, CellClassPipe, CellStylePipe] as const;
