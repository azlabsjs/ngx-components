import { ObservableInput } from 'rxjs';
import { getHost, rxRequest } from './helpers';
import { HTTPResponseType, HTTPStatefulMethod, RequestClient } from './types';

type _RequestFunction = <T>(
  path: string,
  method: HTTPStatefulMethod,
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
export function createSubmitHttpHandler(host?: string) {
  host = host ? getHost(host) : host;
  const _request = function <T>(
    path: string,
    method: HTTPStatefulMethod,
    body: unknown,
    options?: {
      headers?: HeadersInit;
      responseType?: HTTPResponseType;
    }
  ) {
    const url = host
      ? `${host}/${path.startsWith('/') ? path.slice(1) : path}`
      : path;
    return rxRequest<T>({
      url,
      method,
      body,
      ...options,
    });
  };
  return Object.defineProperty(_request, 'request', {
    value: <T>(
      path: string,
      method: HTTPStatefulMethod,
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
