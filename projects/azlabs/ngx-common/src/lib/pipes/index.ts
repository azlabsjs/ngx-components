import {
  ArrayLengthPipe,
  IsArrayPipe,
  ArrayPipe,
  JoinPipe,
  LengthPipe,
  ConcatPipe,
  ContainsPipe,
  IsarrayPipe,
  InArrayPipe,
  MergePipe,
  ArrayFindPipe,
  ArrayFirstPipe,
  AsArrayPipe,
} from './common/arrays.pipe';
import { IsAsyncPipe, AsObservablePipe } from './common/async.pipe';
import { ParseIntPipe } from './common/parse-int.pipe';
import { ParseStrPipe, StrLengthPipe, FormatPipe, StrPipe } from './common/str.pipe';
import { PipeResultPipe } from './common/pipe-result.pipe';
import { PropertyValuePipe } from './common/property.pipe';
import { NgxTransformPipe } from './transform';
import {
  AsAnyPipe,
  DefinedPipe,
  IncludesPipe,
  IndexOfPipe,
  KeysPipe,
  NotEmptyPipe,
  EmptyPipe,
} from './common/utils.pipe';
import { CommonStringsPipe, AsyncTextPipe, CommonTextPipe } from './strings';

export {
  AsAnyPipe,
  DefinedPipe,
  IncludesPipe,
  IndexOfPipe,
  KeysPipe,
  EmptyPipe,
  NotEmptyPipe,
} from './common/utils.pipe';
export { IsAsyncPipe, AsObservablePipe } from './common/async.pipe';
export { PipeResultPipe } from './common/pipe-result.pipe';
export { ParseIntPipe } from './common/parse-int.pipe';
export { ParseStrPipe, StrLengthPipe, FormatPipe, StrPipe } from './common/str.pipe';
export { PropertyValuePipe } from './common/property.pipe';
export {
  ArrayLengthPipe,
  IsArrayPipe,
  ArrayPipe,
  JoinPipe,
  LengthPipe,
  ConcatPipe,
  ContainsPipe,
  IsarrayPipe,
  InArrayPipe,
  MergePipe,
  ArrayFindPipe,
  ArrayFirstPipe,
  AsArrayPipe
} from './common/arrays.pipe';

/** types & declarations from transform namespace */
export * from './transform';

/** types & declarations from strings namespace */
export * from './strings';

/** @description standalone pipes */
export const COMMON_PIPES = [
  ArrayLengthPipe,
  CommonStringsPipe,
  IsArrayPipe,
  IsAsyncPipe,
  PipeResultPipe,
  ParseIntPipe,
  ParseStrPipe,
  PropertyValuePipe,
  LengthPipe,
  ArrayPipe,
  StrLengthPipe,
  FormatPipe,
  NgxTransformPipe,
  CommonTextPipe,
  AsyncTextPipe,
  JoinPipe,
  DefinedPipe,
  IncludesPipe,
  IndexOfPipe,
  AsObservablePipe,
  AsAnyPipe,
  KeysPipe,
  EmptyPipe,
  NotEmptyPipe,
  InArrayPipe,
  MergePipe,
  ArrayFindPipe,
  ArrayFirstPipe,
  ConcatPipe,
  ContainsPipe,
  IsarrayPipe,
  StrPipe,
  AsArrayPipe
] as const;
