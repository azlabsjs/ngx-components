import { Injector } from '@angular/core';
import {
  getHttpHost,
  HttpRequest,
  HTTPRequestMethods,
  HttpResponseType,
} from '@azlabsjs/requests';
import { ObservableInput } from 'rxjs';
import { map } from 'rxjs/operators';
import { rxRequest } from './helpers';
import { InterceptorFactory, RequestClient } from './types';

type _RequestFunction = <T>(
  path: string,
  method: HTTPRequestMethods,
  body: unknown,
  options?: {
    headers?: HeadersInit;
    responseType?: HttpResponseType;
  }
) => ObservableInput<T>;

/**
 * Creates an observable based Http request client
 * for submitting form data
 *
 * ```js
 * const client = createSubmitHttpHandler('http://127.0.0.1:4300');
 *
 * client.send('api/v1/todos', 'POST', {...}); // {..} -> Request body
 * ```
 *
 * @param host
 * @returns
 */
export function createSubmitHttpHandler(
  injector: Injector,
  host?: string,
  interceptorFactory?: InterceptorFactory<HttpRequest>
) {
  host = host ? getHttpHost(host) : host;
  const _request = function <T>(
    path: string,
    method: 'POST' | 'PUT' | 'PATCH',
    body: unknown,
    options?: {
      headers?: HeadersInit;
      responseType?: HttpResponseType;
    }
  ) {
    const url = host
      ? `${host}/${path.startsWith('/') ? path.slice(1) : path}`
      : path;
    options = options || {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      responseType: 'json',
    };
    return rxRequest({
      url,
      method,
      body,
      ...options,
      interceptors: interceptorFactory ? [interceptorFactory(injector)] : [],
    }).pipe(map((state) => state.response));
  };

  return Object.defineProperty(_request, 'request', {
    value: <T>(
      path: string,
      method: 'POST' | 'PUT' | 'PATCH',
      body: unknown,
      options?: {
        headers?: HeadersInit;
        responseType?: HttpResponseType;
      }
    ) => {
      return _request<T>(path, method, body, options);
    },
  }) as _RequestFunction & RequestClient;
}
