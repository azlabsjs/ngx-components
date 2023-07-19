import { ObservableInput } from 'rxjs';
import { Injector } from '@angular/core';
import {
  Interceptor,
  HTTPRequestMethods,
  HTTPResponseType,
  HTTPRequest,
} from '@azlabsjs/requests';

export type InterceptorFactory<T> = (injector: Injector) => Interceptor<T>;

export interface RequestClient {
  /**
   * Makes an HTTP Request to a server enpoint and returns
   * an observable of response type
   *
   * @param path The path to API resource or full server url
   * @param method
   * @param body
   * @param options
   */
  request<T>(
    path: string,
    method: HTTPRequestMethods,
    body: unknown,
    options?: {
      headers?: HeadersInit;
      responseType?: HTTPResponseType;
    }
  ): ObservableInput<T>;
}

export type RequestOptionsType =
  | {
      url: string;
      method: HTTPRequestMethods;
      body?: any;
      headers?: HeadersInit;
      responseType?: HTTPResponseType;
      interceptors?: Interceptor<HTTPRequest>[];
    }
  | string;
// TODO: Add a REST CLIENT interface with methods like get(), post(), put(), delete(), path(), options(), head(), etc...
