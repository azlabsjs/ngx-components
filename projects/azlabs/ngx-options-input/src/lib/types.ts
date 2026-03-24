import { Injector } from '@angular/core';
import { HTTPRequest, HTTPResponse, Interceptor } from '@azlabsjs/requests';
import { InputOptions, OptionsConfig } from '@azlabsjs/smart-form-core';
import { Observable, Observer } from 'rxjs';

/** @description Type declaration of option query client */
export type InputOptionsClient = {
  //
  /** @description Query list of select options from forms provider database */
  request(
    optionsConfig: OptionsConfig & { name?: string },
    searchParams?: Record<string, unknown>
  ): Observable<InputOptions>;
};

/**  @internal */
type QueryConfigType = {
  [name: string]:
    | string
    | (() => string)
    | {
        host?: string | (() => string);
        interceptor?: InterceptorFactory<
          HTTPRequest,
          HTTPResponse | Promise<HTTPResponse> | unknown | Promise<unknown>
        >;
      };
};

/** @description Options query request interceptor type definition */
export type InterceptorFactory<T, R = unknown> = (
  injector: Injector
) => Interceptor<T, R>;

/** @description Options query configuration type definition */
export type OptionsQueryConfigType = {
  interceptorFactory?: InterceptorFactory<
    HTTPRequest,
    Promise<HTTPResponse> | HTTPResponse | Promise<unknown> | unknown
  >;
  queries?: QueryConfigType;
};

// @internal
export type Subscription = {
  unsubscribe: () => void;
};

// @internal
type NextFunction<T> = (value: T) => void;

// @internal
export type Subscribable<T> = {
  subscribe(observer?: Partial<Observer<T>> | NextFunction<T>): Subscription;
};

// @internal
export type ObservableOptionsConfig<
  T = {
    [k: string]: unknown;
  }
> = Omit<OptionsConfig, 'refetch'> & {
  refetch: Subscribable<T>;
};

/** @interal */
export type KeyType = Record<string, unknown>;

/** @internal */
export type QueryType = { page?: number; per_page?: number } & Record<
  string,
  unknown
>;

/** @internal */
export type OptionsConfigType = OptionsConfig | ObservableOptionsConfig;
