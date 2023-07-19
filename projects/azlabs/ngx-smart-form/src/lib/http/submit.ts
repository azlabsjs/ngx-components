import { Injector } from '@angular/core';
import {
  HTTPRequest,
  HTTPRequestMethods,
  HTTPResponseType,
  getHttpHost,
} from '@azlabsjs/requests';
import { isValidHttpUrl } from '@azlabsjs/smart-form-core';
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
    responseType?: HTTPResponseType;
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
  interceptorFactory?: InterceptorFactory<HTTPRequest>
) {
  host = host ? getHttpHost(host) : host;
  const _request = function <T>(
    path: string,
    method: 'POST' | 'PUT' | 'PATCH',
    body: unknown,
    options?: {
      headers?: HeadersInit;
      responseType?: HTTPResponseType;
    }
  ) {
    // We construct the request submit handler to use the request path if
    // it is a valid HTTP request path, else compose it with configured request host
    const url = isValidHttpUrl(path)
      ? path
      : host
      ? `${host}/${path.startsWith('/') ? path.slice(1) : path}`
      : path;

    // Provides at least HTTP request options if none provided
    // by the library user
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
    }).pipe(map((state) => state.body));
  };

  return Object.defineProperty(_request, 'request', {
    value: <T>(
      path: string,
      method: 'POST' | 'PUT' | 'PATCH',
      body: unknown,
      options?: {
        headers?: HeadersInit;
        responseType?: HTTPResponseType;
      }
    ) => {
      return _request<T>(path, method, body, options);
    },
  }) as _RequestFunction & RequestClient;
}
