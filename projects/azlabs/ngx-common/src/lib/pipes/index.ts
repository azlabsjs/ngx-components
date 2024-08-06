import {
  ArrayLengthPipe,
  ArrayPipe,
  IsArrayPipe,
  JoinPipe,
  LengthPipe
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
import { AsyncTextPipe, CommonStringsPipe, CommonTextPipe } from './strings';


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
  LengthPipe
} from './common/arrays.pipe';

/** Exported types & declarations from transform namespace */
export * from './transform';

/** Exported types & declarations from strings namespace */
export * from './strings';

/** @description Exported standalone pipes */
export const COMMON_PIPES = [
  IsAsyncPipe,
  PipeResultPipe,
  ParseIntPipe,
  ParseStrPipe,
  PropertyValuePipe,
  ArrayLengthPipe,
  LengthPipe,
  IsArrayPipe,
  ArrayPipe,
  StrLengthPipe,
  NgxTransformPipe,
  CommonStringsPipe,
  CommonTextPipe,
  AsyncTextPipe,
  JoinPipe,
  DefinedPipe,
  IncludesPipe,
  IndexOfPipe,
  AsObservablePipe,
  AsAnyPipe,
] as const;
