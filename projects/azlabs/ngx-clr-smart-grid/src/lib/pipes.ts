import { Pipe, PipeTransform } from '@angular/core';
import { GridConfigType, GriSelectDirectiveInputType } from './core';
import { selectionTypeAttribute } from '@clr/angular';

@Pipe({
  name: 'gridRowClass',
  pure: true,
  standalone: true,
})
export class GridRowClassPipe implements PipeTransform {
  /** resolve row class based on provided data */
  transform(config: GridConfigType, current: { [index: string]: any }) {
    return config && config.projectRowClass ? typeof config.projectRowClass === 'function' ? config.projectRowClass(current) : config.projectRowClass : '';
  }
}

@Pipe({
  name: 'cssclass',
  pure: true,
  standalone: true,
})
export class CellClassPipe implements PipeTransform {
  transform(
    value: string | string[] | ((value: unknown, model: Record<string, unknown>) => string) | undefined,
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
    value: string | string[] | ((value: unknown, model: Record<string, unknown>) => string) | undefined,
    p: unknown,
    model: Record<string, unknown>
  ) {
    return typeof value === 'function' ? value(p, model) : value ?? '';
  }
}


@Pipe({
  name: 'gridSelectionType',
  pure: true,
  standalone: true,
})
export class SelectionType implements PipeTransform {
  transform(config: GriSelectDirectiveInputType) {
    const selectionType = config.selectionType ?? (config.singleSelection ? 'single' : 'multi');
    return selectionTypeAttribute(selectionType);
  }
}

export const PIPES = [GridRowClassPipe, CellClassPipe, CellStylePipe, SelectionType] as const;
