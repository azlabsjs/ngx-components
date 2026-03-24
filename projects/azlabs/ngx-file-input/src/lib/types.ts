import { Injector } from '@angular/core';
import { Interceptor, RequestClient } from '@azlabsjs/requests';
import { UploadOptions } from '@azlabsjs/uploader';

/** @description interceptor dactory type declaration */
export type InterceptorFactory<T> = (injector: Injector) => Interceptor<T>;

/** @internal file input constraints type declaration */
export type InputConstraints = {
  maxFiles?: number;
  maxFilesize?: number;
};

/** @internal set state parameter type declaration  */
export type SetStateParam<T> = (state: T) => T;

/** @internal internal type definition of upload component injected options */
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

// @internal
export type FileEventTarget = EventTarget & { files: FileList };

// @internal
export type EventType<T = EventTarget> = Omit<Event, 'target'> & {
  target: T;
};

/** @interal */
export type ErrorStateType = {
  type: 'size' | 'upload' | 'accept';
  data?: File[];
  error?: unknown;
};

/** @internal */
export type StateType = {
  uploading: boolean;
  error: ErrorStateType | undefined | null;
};

/** @internal */
export type ValueType = EventArgType | EventArgType[] | string | string[];
