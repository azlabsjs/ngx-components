import { PipeTransform, Type } from '@angular/core';

/** @internal */
export type PipeTransformTokenMapType = {
  [k: string]: Type<PipeTransform>;
};

/** @internal */
export type PipeTransformType = string | ((value: any) => any) | undefined;