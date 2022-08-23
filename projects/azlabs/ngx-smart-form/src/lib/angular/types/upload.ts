import { Injector } from '@angular/core';
import { RequestClient } from '@azlabsjs/requests';
import { UploadOptions } from '@azlabsjs/uploader';
import { InterceptorFactory } from './interceptors';

/**
 * @internal
 *
 * Internal type definition of Upload component injected options
 */
export type UploadOptionsType<T, R> = Omit<
  UploadOptions<T, R>,
  'interceptor'
> & {
  interceptorFactory?: InterceptorFactory<T>;
  backendFactory?: (injector: Injector) => RequestClient<T, R>;
};
