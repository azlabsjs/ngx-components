import { PipeTransform, ProviderToken } from '@angular/core';

/**
 * @internal
 */
export type PipeTransformTokenMapType = {
  [k: string]: ProviderToken<PipeTransform>;
};
