import { Injector } from '@angular/core';
import { HTTPRequest, HTTPResponse, Interceptor } from '@azlabsjs/requests';
import {
  InputOptionsInterface,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { Observable } from 'rxjs';

export type InputOptionsClient = {
  //
  /**
   * @description Query list of select options from forms provider database
   *
   */
  request(
    optionsConfig: OptionsConfig & { name?: string },
    searchParams?: Record<string, unknown>
  ): Observable<InputOptionsInterface>;
};

/**
 * @internal
 */
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

/**
 * Options query request interceptor type definition
 */
export type InterceptorFactory<T, R = unknown> = (
  injector: Injector
) => Interceptor<T, R>;


/**
 * Options query configuration type definition
 */
export type OptionsQueryConfigType = {
  interceptorFactory?: InterceptorFactory<
    HTTPRequest,
    Promise<HTTPResponse> | HTTPResponse | Promise<unknown> | unknown
  >;
  queries?: QueryConfigType;
};
