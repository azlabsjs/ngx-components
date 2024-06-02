import { Injector } from '@angular/core';
import { Interceptor, RequestClient } from '@azlabsjs/requests';
import { UploadOptions } from '@azlabsjs/uploader';

/** @description Interceptor dactory type declaration */
export type InterceptorFactory<T> = (injector: Injector) => Interceptor<T>;

/** @internal File Input constraints type declaration */
export type InputConstraints = {
  maxFiles?: number;
  maxFilesize?: number;
};

/** @internal Set state parameter type declaration  */
export type SetStateParam<T> = ((state: T) => T);

/** @internal Internal type definition of Upload component injected options */
export type UploadOptionsType<T, R> = Omit<
  UploadOptions<T, R>,
  'interceptor'
> & {
  interceptorFactory?: InterceptorFactory<T>;
  backendFactory?: (injector: Injector) => RequestClient<T, R>;
};

/** @description Ngx file input event argument type declaration */
export type EventArgType<T extends any = any> = File & {
  upload?: {
    error?: unknown;
    result: T;
  };
};
