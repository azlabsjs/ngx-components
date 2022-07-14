import { ObservableInput } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';
import { HTTPRequestMethods, HTTPResponseType } from './types';

/**
 * Get the host part of a web url object
 * //@internal
 *
 * @param url
 */
export function getHost(url: string) {
  if (url) {
    const webURL = new URL(url);
    url = `${webURL.protocol}//${webURL.host}`;
    return `${`${url.endsWith('/') ? url.slice(0, -1) : url}`}`;
  }
  return url ?? '';
}

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
        body: any;
        headers?: HeadersInit;
        responseType?: HTTPResponseType; // -> default=json
      }
    | string
) {
  if (typeof request === 'string') {
    request = {
      url: request,
      method: 'GET',
      body: undefined,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      responseType: 'json',
    };
  }
  let { headers, responseType = 'json', body, method, url } = request;
  // Returns the expected response type based on the response type
  // property
  const selector: (response: Response) => ObservableInput<T> = (response) => {
    switch (responseType.toLocaleLowerCase()) {
      case 'json':
        return response.json();
      case 'array':
        return response.arrayBuffer();
      case 'blob':
        return response.blob();
      case 'text':
        return response.text();
      default:
        return new Promise((resolve) => {
          resolve(response.body as any);
        });
    }
  };
  let _headers: Headers;
  if (typeof headers === 'undefined' || headers == null) {
    _headers = new Headers({
      'Content-Type': 'application/json;charset=UTF-8',
    });
  } else {
    _headers = new Headers(headers);
  }
  if (['GET', 'HEAD', 'OPTION'].includes(method.toUpperCase())) {
    const _query = body ?? undefined;
    if (_query) {
      url = `${url.includes('?') ? url : `${url}?`}${new URLSearchParams(
        body as Record<string, string>
      ).toString()}`;
    }
    body = null;
  }
  return fromFetch(url, {
    method,
    body:
      _headers.get('content-type')?.includes('application/json') &&
      typeof body === 'object' &&
      body !== null
        ? JSON.stringify(body)
        : body,
    headers: _headers,
    credentials: 'include',
    selector,
  });
}
