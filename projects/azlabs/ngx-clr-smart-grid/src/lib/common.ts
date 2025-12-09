import { NgxClrGridSelectDirective } from './directives';
import { NgxClrSmartGridComponent } from './grid.component';
import { CellClassPipe, CellStylePipe, GridRowClassPipe } from './pipes';

/** @description Exported grid directives */
export const DIRECTIVES = [
  NgxClrSmartGridComponent,
  NgxClrGridSelectDirective,
] as const;


export const PIPES = [
  GridRowClassPipe,
  CellClassPipe,
  CellStylePipe,
] as const;