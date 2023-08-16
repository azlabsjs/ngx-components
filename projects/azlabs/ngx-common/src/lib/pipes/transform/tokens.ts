import { InjectionToken } from '@angular/core';
import { PipeTransformTokenMapType } from './types';

/**
 * Pipe transform injection token provider 
 */
export const PIPE_TRANSFORMS = new InjectionToken<PipeTransformTokenMapType>(
  'Map of pipe name to pipe transform instances'
);
