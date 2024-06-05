/** Library exported pipe instances */
export {
  IsAsyncPipe,
  PipeResultPipe,
  ParseIntPipe,
  ParseStrPipe,
  PropertyValuePipe,
  COMMON_PIPES,
  ArrayLengthPipe,
  IsArrayPipe,
  ArrayPipe,
  StrLengthPipe,
  CommonStringsPipe,
  ProvideCommonStringsType,
  provideCommonStrings,
  provideCommonStringsFactory,
  COMMON_STRINGS,
  PipeTransformTokenMapType,
  NgxTransformPipe,
  createPipeTransform,
  PIPE_TRANSFORMS,
  JoinPipe,
  DefinedPipe,
  IncludesPipe,
} from './pipes';

// Exported module
export { NgxCommonModule } from './ngx-common.module';

/** Exported library providers */
export { providePipes } from './providers';
