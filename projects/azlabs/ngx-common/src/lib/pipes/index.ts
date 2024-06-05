import {
  ArrayLengthPipe,
  ArrayPipe,
  IsArrayPipe,
  JoinPipe,
} from './common/arrays.pipe';
import { IsAsyncPipe } from './common/is-async.pipe';
import { ParseIntPipe } from './common/parse-int.pipe';
import { ParseStrPipe, StrLengthPipe } from './common/str.pipe';
import { PipeResultPipe } from './common/pipe-result.pipe';
import { PropertyValuePipe } from './common/property.pipe';
import { NgxTransformPipe } from './transform';
import { DefinedPipe, IncludesPipe } from './common/utils.pipe';
import { CommonStringsPipe } from './strings';

/** Exports */
export { DefinedPipe, IncludesPipe } from './common/utils.pipe';
export { IsAsyncPipe } from './common/is-async.pipe';
export { PipeResultPipe } from './common/pipe-result.pipe';
export { ParseIntPipe } from './common/parse-int.pipe';
export { ParseStrPipe, StrLengthPipe } from './common/str.pipe';
export { PropertyValuePipe } from './common/property.pipe';
export {
  ArrayLengthPipe,
  IsArrayPipe,
  ArrayPipe,
  JoinPipe,
} from './common/arrays.pipe';
export {
  PipeTransformTokenMapType,
  NgxTransformPipe,
  createPipeTransform,
  PIPE_TRANSFORMS,
} from './transform';
export {
  CommonStringsPipe,
  ProvideCommonStringsType,
  provideCommonStrings,
  provideCommonStringsFactory,
  COMMON_STRINGS,
} from './strings';

/** @description Exported pipes transforms */
export const COMMON_PIPES = [
  IsAsyncPipe,
  PipeResultPipe,
  ParseIntPipe,
  ParseStrPipe,
  PropertyValuePipe,
  ArrayLengthPipe,
  IsArrayPipe,
  ArrayPipe,
  StrLengthPipe,
  NgxTransformPipe,
  CommonStringsPipe,
  JoinPipe,
  DefinedPipe,
  IncludesPipe,
] as const;
