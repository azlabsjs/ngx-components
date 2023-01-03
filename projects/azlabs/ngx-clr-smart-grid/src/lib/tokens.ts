import { InjectionToken } from '@angular/core';
import { PipeTransformTokenMapType } from './types';

/**
 * @internal
 * Pipe transform map
 */
export const PIPE_TRANSFORMS = new InjectionToken<PipeTransformTokenMapType>(
  'Map of pipe name to pipe transform instances'
);
