import { Observable, ObservableInput } from 'rxjs';
import { SelectOptionsClient } from '../core';
import { getHost, rxRequest } from './helpers';

type _OptionsRequestFunction = <T>(
  param: string,
  url?: string
) => ObservableInput<T>;

export function createSelectOptionsQuery(endpoint?: string, path?: string) {
  if (endpoint === null && typeof endpoint === 'undefined') {
    endpoint = path;
    path = undefined;
  }
  if (typeof endpoint === 'undefined' || endpoint === null) {
    throw new Error('Query endpoint must be a valid http host or url!');
  }
  endpoint = path
    ? `${getHost(endpoint)}/${
        path.startsWith('/') ? path.slice(0, path.length - 1) : path
      }`
    : endpoint;

  const _request = queryOptions;
  return Object.defineProperty(_request, 'request', {
    value: <T>(param: string, path?: string) => {
      return _request<T>(path ? `${endpoint}/${path}` : `${endpoint}`, param);
    },
  }) as any as _OptionsRequestFunction & SelectOptionsClient;
}

export function queryOptions<T = Observable<{ [prop: string]: any }[]>>(
  endpoint: string,
  param: string
) {
  return rxRequest<T>({
    url: endpoint,
    method: 'GET',
    body: {
      table_config: param,
    },
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    responseType: 'json',
  });
}
