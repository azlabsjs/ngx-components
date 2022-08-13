import { Injector } from '@angular/core';
import { getHttpHost, HTTPRequest } from '@azlabsjs/requests';
import { isValidHttpUrl, OptionsConfig } from '@azlabsjs/smart-form-core';
import { map, ObservableInput, tap } from 'rxjs';
import { InputOptionsClient } from '../angular/types/options';
import { rxRequest } from './helpers';
import { InterceptorFactory } from './types';

type _OptionsRequestFunction = <T>(
  param: string,
  url?: string
) => ObservableInput<T>;

type OptionsQueryParams = OptionsConfig & { url: string };

function createQueryURL(optionsConfig: OptionsConfig) {
  return `${optionsConfig.source.resource}${
    optionsConfig.params?.filters
      ? `?${optionsConfig.params?.filters
          .replace('[[', '')
          .replace(']]', '')
          .replace('|', '&')}`
      : ''
  }`;
}

// @internal
export function createSelectOptionsQuery(
  injector: Injector,
  endpoint?: string,
  path?: string,
  interceptorFactory?: InterceptorFactory<HTTPRequest>
) {
  let _endpoint!: string;
  let _path!: string | undefined;
  if (endpoint === null && typeof endpoint === 'undefined') {
    _endpoint = path ?? 'http://localhost';
    _path = undefined;
  } else {
    _path = path;
  }
  _endpoint = _path
    ? `${getHttpHost(_endpoint)}/${
        _path.startsWith('/') ? _path.slice(0, _path.length - 1) : _path
      }`
    : _endpoint;

  const _requestClient = queryOptions;
  Object.defineProperty(_requestClient, 'request', {
    value: (optionsConfig: OptionsConfig) => {
      // We build the request query
      const url = isValidHttpUrl(optionsConfig.source.resource)
        ? createQueryURL(optionsConfig)
        : _path
        ? `${_endpoint}/${_path}`
        : `${_endpoint}`;
      const request = { ...optionsConfig, url };
      return _requestClient(request, injector, interceptorFactory);
    },
  });
  return _requestClient as any as _OptionsRequestFunction & InputOptionsClient;
}

export function queryOptions(
  optionsConfig: OptionsQueryParams,
  injector: Injector,
  interceptorFactory?: InterceptorFactory<HTTPRequest>
) {
  // We provides a request body only if the resource object is not a valid
  // HTTP URI because in such case the request is being send to form API server
  // instead of any resource server
  const body = isValidHttpUrl(optionsConfig.source.resource)
    ? undefined
    : {
        table_config: optionsConfig.source.raw,
      };
  return rxRequest({
    url: optionsConfig.url,
    method: 'GET',
    body,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    responseType: 'json',
    interceptors: interceptorFactory ? [interceptorFactory(injector)] : [],
  }).pipe(map((state) => state.body));
}
