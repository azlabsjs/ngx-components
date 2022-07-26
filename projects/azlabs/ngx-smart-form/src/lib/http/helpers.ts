import {
  useRequestClient,
  HTTPRequestMethods,
  HttpResponseType,
  Interceptor,
  HttpRequest,
} from '@azlabsjs/requests';
import { from } from 'rxjs';

/**
 * Makes an http request using rxjs fetch wrapper
 *
 * **Note**
 * If no Content-Type header is provided to the request client
 * a default application/json content type is internally used
 *
 * @param request
 * @returns
 */
export function rxRequest(
  request:
    | {
        url: string;
        method: HTTPRequestMethods;
        body?: any;
        headers?: HeadersInit;
        responseType?: HttpResponseType;
        interceptors?: Interceptor<HttpRequest>[];
      }
    | string
) {
  if (typeof request === 'string') {
    request = {
      url: request,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      responseType: 'json',
    };
  }
  let {
    headers,
    responseType = 'json',
    body,
    method,
    url,
    interceptors,
  } = request;
  let _headers: Record<string, any> = {};
  if (headers instanceof Headers) {
    headers.forEach((value, name) => {
      _headers[name] = value;
    });
  } else if (Array.isArray(headers)) {
    for (const [key, value] of headers) {
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        _headers[key] = value;
      }
    }
  } else if (typeof headers === 'object') {
    for (const key in headers) {
      if (Object.prototype.hasOwnProperty.call(headers, key)) {
        _headers[key] = headers[key];
      }
    }
  } else {
    // By default request are send as JSON request
    _headers = {
      'Content-Type': 'application/json;charset=UTF-8',
    };
  }
  const client = useRequestClient();
  return from(
    client.request({
      url,
      method,
      body,
      options: {
        headers: _headers,
        // withCredentials: true,
        responseType,
        interceptors,
      },
    })
  );
}
