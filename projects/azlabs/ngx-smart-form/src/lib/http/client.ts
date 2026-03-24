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
 * @deprecated
 * 
 * this function is deprecated du to the fact that it does not serve
 * the general HTTP request purpose that it should serve. use the replacement `createRequestClient` instead
 * 
 * Creates an observable based Http request client
 * for submitting form data
 *
 * ```js
 * const client = createSubmitHttpHandler('http://127.0.0.1:4300');
 *
 * client.send('api/v1/todos', 'POST', {...}); // {..} -> Request body
 * ```
 *
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
    // we construct the request submit handler to use the request path if
    // it is a valid HTTP request path, else compose it with configured request host
    const url = isValidHttpUrl(path)
      ? path
      : host
      ? `${host}/${path.startsWith('/') ? path.slice(1) : path}`
      : path;

    // provides at least HTTP request options if none provided
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



/**
 * creates an observable based Http request client
 * for submitting form data
 *
 * ```js
 * const client = createRequestClient('http://127.0.0.1:4300');
 *
 * client.send('api/v1/todos', 'POST', {...}); // {..} -> Request body
 * ```
 * 
 */
export function createRequestClient(
  injector: Injector,
  host?: string,
  interceptorFactory?: InterceptorFactory<HTTPRequest>
) {
  host = host ? getHttpHost(host) : host;
  const _request = function <T = unknown>(
    url: string,
    method: HTTPRequestMethods,
    body: T,
    options?: {
      query?: { [prop: string]: unknown };
      headers?: HeadersInit;
      responseType?: HTTPResponseType;
    }
  ) {
    // We construct the request submit handler to use the request path if
    // it is a valid HTTP request path, else compose it with configured request host
    let _url = isValidHttpUrl(url)
      ? url
      : host
      ? `${host}/${url.startsWith('/') ? url.slice(1) : url}`
      : url;

    // Provides at least HTTP request options if none provided
    // by the library user
    const { headers, responseType, query } = options || {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      responseType: 'json',
    };

    // Here we append query strings to the url
    if (query) {
      const queryString = (Object.keys(query) as (keyof typeof query)[])
        .reduce((arr, key) => {
          arr.push(`${key}=${query[key]}`);
          return arr;
        }, [] as string[])
        .join('&');
      _url = _url.endsWith('?')
        ? `${_url}&${queryString}`
        : `${_url}?${queryString}`;
    }

    return rxRequest({
      url: _url,
      method,
      body,
      headers,
      responseType,
      interceptors: interceptorFactory ? [interceptorFactory(injector)] : [],
    }).pipe(map((state) => state.body));
  };

  return Object.defineProperty(_request, 'request', {
    value: <T = unknown>(
      path: string,
      method: HTTPRequestMethods,
      body: T,
      options?: {
        headers?: HeadersInit;
        responseType?: HTTPResponseType;
      }
    ) => {
      return _request<T>(path, method, body, options);
    },
  }) as _RequestFunction & RequestClient;
}