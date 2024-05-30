import {
  AsyncPipe,
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  LowerCasePipe,
  PercentPipe,
  SlicePipe,
  UpperCasePipe,
} from '@angular/common';
import {
  PIPE_TRANSFORMS,
  PipeTransformTokenMapType,
} from '@azlabsjs/ngx-common';


// TODO: Export the providers as in ngx-common module
/** @description Exported pipes used as service providers by the grid component */
export const PROVIDERS = [
  UpperCasePipe,
  LowerCasePipe,
  CurrencyPipe,
  DecimalPipe,
  JsonPipe,
  PercentPipe,
  SlicePipe,
  AsyncPipe,
] as const;

/** @description Provide List of pipes that will be dynamically used by the gid component to transform values */
// TODO: Move this into ngx-common module
export function providePipes(config: {
  pipes: PipeTransformTokenMapType;
  debug?: boolean;
}) {
  return {
    provide: PIPE_TRANSFORMS,
    useFactory: () => {
      let { pipes } = config ?? {};
      return pipes ?? {};
    },
  };
}
