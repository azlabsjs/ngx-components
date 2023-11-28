import { Injector } from '@angular/core';
import { Interceptor, RequestClient } from '@azlabsjs/requests';
import { UploadOptions } from '@azlabsjs/uploader';

export type InterceptorFactory<T> = (injector: Injector) => Interceptor<T>;

/**
 * File Input constraints type declaration
 *
 * @internal
 */
export type InputConstraints = {
  maxFiles?: number;
  maxFilesize?: number;
};

/**
 * Set state parameter type declaration
 *
 * @internal
 */
export type SetStateParam<T> = Partial<T> | ((state: T) => T);

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

/**
 * Ngx file input event argument type declaration
 */
export type EventArgType<T extends any = any> = File & {
  upload?: {
    error?: unknown;
    result: T;
  };
};
