import { Injector } from '@angular/core';
import { getHttpHost, HTTPRequest } from '@azlabsjs/requests';
import {
  customToResourceURL,
  isCustomURL,
  isValidHttpUrl,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { map, ObservableInput } from 'rxjs';
import { InputOptionsClient } from '../angular/types/options';
import { rxRequest } from './helpers';
import { InterceptorFactory } from './types';

type _OptionsRequestFunction = <T>(
  param: string,
  url?: string
) => ObservableInput<T>;

type OptionsQueryParams = OptionsConfig & { url: string };

/**
 * @internal
 *
 * @param url
 * @param optionsConfig
 */
function createQueryURL(url: string, optionsConfig: OptionsConfig) {
  return `${url}${
    optionsConfig.params?.filters
      ? `?${optionsConfig.params?.filters
          .replace('[[', '')
          .replace(']]', '')
          .replace('|', '&')}`
      : ''
  }`;
}

/**
 *
 * @internal
 *
 * @param value
 * @param host
 */
function createRequestURL(value: OptionsConfig, host: string, path?: string) {
  const url = value.source.resource;
  return isValidHttpUrl(url)
    ? createQueryURL(url, value)
    : url
    ? url
    : path
    ? `${host}/${path}`
    : `${host}`;
}

// @internal
export function createSelectOptionsQuery(
  injector: Injector,
  endpoint?: string,
  path?: string,
  interceptorFactory?: InterceptorFactory<HTTPRequest>
) {
  let _endpoint!: string | undefined;
  let _path!: string;
  if (endpoint === null || typeof endpoint === 'undefined') {
    _endpoint =
      typeof path !== 'undefined' && path !== null && isValidHttpUrl(path)
        ? path
        : undefined;
    _path = '';
  } else {
    _path = path ?? '';
    _endpoint = endpoint;
  }
  _endpoint =
    _path && _endpoint
      ? `${getHttpHost(_endpoint)}/${
          _path.startsWith('/') ? _path.slice(0, _path.length - 1) : _path
        }`
      : _endpoint;
  const _requestClient = queryOptions;
  Object.defineProperty(_requestClient, 'request', {
    value: (optionsConfig: OptionsConfig) => {
      // We build the request query
      //#region For custom URL configurations, we attempt to build the final URL and update the
      // the resource entry if source property of the option configurations
      let url = optionsConfig.source.resource;
      if (isCustomURL(url ?? '')) {
        url = customToResourceURL(url, _endpoint ?? '');
        url = url[0] === '/' ? url.substring(1) : url;
        optionsConfig = {
          ...optionsConfig,
          source: { ...(optionsConfig.source ?? {}), resource: url },
        };
      }
      //#endregion
      const request = {
        ...optionsConfig,
        url: createRequestURL(
          optionsConfig,
          _endpoint ?? '',
          _path[0] === '/' ? _path?.substring(1) : _path
        ),
      };
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
