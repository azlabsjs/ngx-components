import {
  ArrayLengthPipe,
  ArrayPipe,
  IsArrayPipe,
  JoinPipe,
} from './common/arrays.pipe';
import { IsAsyncPipe, AsObservablePipe } from './common/async.pipe';
import { ParseIntPipe } from './common/parse-int.pipe';
import { ParseStrPipe, StrLengthPipe } from './common/str.pipe';
import { PipeResultPipe } from './common/pipe-result.pipe';
import { PropertyValuePipe } from './common/property.pipe';
import { NgxTransformPipe } from './transform';
import {
  AsAnyPipe,
  DefinedPipe,
  IncludesPipe,
  IndexOfPipe,
} from './common/utils.pipe';
import { CommonStringsPipe, CommonTextPipe } from './strings';

/** Exports */
export {
  AsAnyPipe,
  DefinedPipe,
  IncludesPipe,
  IndexOfPipe,
} from './common/utils.pipe';
export { IsAsyncPipe, AsObservablePipe } from './common/async.pipe';
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
  CommonTextPipe,
} from './strings';

/** @description Exported standalone pipes */
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
  CommonTextPipe,
  JoinPipe,
  DefinedPipe,
  IncludesPipe,
  IndexOfPipe,
  AsObservablePipe,
  AsAnyPipe,
] as const;
