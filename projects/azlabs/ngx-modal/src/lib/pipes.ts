import { Injector, Pipe, PipeTransform } from '@angular/core';
import { OutletConfig } from './types';

@Pipe({
  name: 'inputs',
  standalone: true,
  pure: true,
})
export class Inputs implements PipeTransform {
  constructor(private injector: Injector) {}

  transform(values: OutletConfig['inputs']) {
    return typeof values === 'function' ? values(this.injector) : (values as Record<string, unknown>);
  }
}

@Pipe({
  name: 'appendcss',
  standalone: true,
  pure: true,
})
export class AppendClasses implements PipeTransform {
  transform(value: string | string[], ...values: string[]) {
    const v = Array.isArray(value) ? value : [value];
    return v.concat(...values);
  }
}

/** Exported standalone pipes */
export const PIPES = [Inputs, AppendClasses] as const;
