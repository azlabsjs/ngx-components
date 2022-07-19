import {
  useRequestClient,
  HTTPRequestMethods,
  HttpResponseType,
} from '@azlabsjs/requests';
import { from } from 'rxjs';

/**
 * Makes an http request using rxjs fetch wrapper
 *
 * @param request
 * @returns
 */
export function rxRequest<T>(
  request:
    | {
        url: string;
        method: HTTPRequestMethods;
        body?: any;
        headers?: HeadersInit;
        responseType?: HttpResponseType;
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
  let { headers, responseType = 'json', body, method, url } = request;
  const client = useRequestClient();
  let _headers: Headers;
  if (typeof headers === 'undefined' || headers == null) {
    _headers = new Headers({
      'Content-Type': 'application/json;charset=UTF-8',
    });
  } else {
    _headers = new Headers(headers);
  }
  return from(
    client.request({
      url,
      method,
      body,
      options: {
        headers: _headers,
        withCredentials: true,
        responseType,
      },
    })
  );
}
