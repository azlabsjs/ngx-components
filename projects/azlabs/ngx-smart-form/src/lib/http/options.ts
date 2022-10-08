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
import { InterceptorFactory, OptionsQueryConfigType } from './types';

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
function resolveURLHost(
  params: OptionsQueryConfigType,
  name: string,
  _default: string
) {
  if (params.queries) {
    const value = params.queries[name];
    if (value && typeof value === 'string') {
      return getHttpHost(value);
    }
    if (value && typeof value === 'function') {
      return value();
    }
    if (value && typeof value === 'object') {
      return typeof value.host === 'string'
        ? getHttpHost(value.host)
        : typeof value.host === 'function'
        ? value.host()
        : _default;
    }
    return _default;
  }
  return _default;
}

// @internal
function resolveRequestInterceptorFactory(
  params: OptionsQueryConfigType,
  name: string
) {
  if (params.queries) {
    const value = params.queries[name];
    return typeof value === 'object'
      ? value.interceptor ?? params.interceptorFactory
      : params.interceptorFactory;
  }
  return params.interceptorFactory;
}

// @internal
export function createSelectOptionsQuery(
  injector: Injector,
  host?: string,
  path?: string,
  queriesConfig?: OptionsQueryConfigType
) {
  const _requestClient = queryOptions;
  Object.defineProperty(_requestClient, 'request', {
    value: (optionsConfig: OptionsConfig & { name?: string }) => {
      let _endpoint!: string | undefined;
      let _path!: string;
      if (host === null || typeof host === 'undefined') {
        _endpoint =
          typeof path !== 'undefined' && path !== null && isValidHttpUrl(path)
            ? path
            : undefined;
        _path = '';
      } else {
        _path = path ?? '';
        _endpoint = host;
      }
      _endpoint =
        _path && _endpoint
          ? `${getHttpHost(_endpoint)}/${
              _path.startsWith('/') ? _path.slice(0, _path.length - 1) : _path
            }`
          : _endpoint;
      // We build the request query
      //#region For custom URL configurations, we attempt to build the final URL and update the
      // the resource entry if source property of the option configurations
      let url = optionsConfig.source.resource;
      if (isCustomURL(url ?? '')) {
        const hostConfig =
          typeof queriesConfig?.queries !== 'undefined' &&
          queriesConfig?.queries !== null &&
          typeof optionsConfig.name !== 'undefined' &&
          optionsConfig.name !== null
            ? resolveURLHost(queriesConfig, optionsConfig.name, _endpoint ?? '')
            : _endpoint ?? '';
        url = customToResourceURL(url, hostConfig);
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
      return _requestClient(
        request,
        injector,
        queriesConfig?.queries && optionsConfig.name
          ? resolveRequestInterceptorFactory(queriesConfig, optionsConfig.name)
          : queriesConfig?.interceptorFactory
      );
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
