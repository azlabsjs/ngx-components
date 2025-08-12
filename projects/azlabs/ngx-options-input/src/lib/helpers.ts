import { Injector } from '@angular/core';
import {
  getHttpHost,
  HTTPRequest,
  HTTPRequestMethods,
  HTTPResponseType,
  Interceptor,
  useRequestClient,
} from '@azlabsjs/requests';
import {
  customToResourceURL,
  isCustomURL,
  isValidHttpUrl,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { from, map, ObservableInput } from 'rxjs';
import {
  InputOptionsClient,
  InterceptorFactory,
  OptionsQueryConfigType,
} from './types';

type _OptionsRequestFunction = <T>(
  param: string,
  url?: string
) => ObservableInput<T>;

type OptionsQueryParams = OptionsConfig & {
  url: string;
  search?: Record<string, unknown>;
};

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
function rxRequest(
  request:
    | {
        url: string;
        method: HTTPRequestMethods;
        body?: any;
        headers?: HeadersInit;
        responseType?: HTTPResponseType;
        interceptors?: Interceptor<HTTPRequest>[];
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
  return from(
    useRequestClient().request({
      url,
      method,
      body,
      options: {
        headers: _headers,
        responseType,
        interceptors,
      },
    })
  );
}

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
 * @param endpoint
 */
function createRequestURL(value: OptionsConfig, endpoint: string) {
  const url = value.source.resource;
  return isValidHttpUrl(url) ? createQueryURL(url, value) : `${endpoint}`;
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
export function optionsQueryClient(
  injector: Injector,
  endpoint?: string,
  queriesConfig?: OptionsQueryConfigType
) {
  const _requestClient = queryOptions;
  Object.defineProperty(_requestClient, 'request', {
    value: (
      optionsConfig: OptionsConfig & { name?: string },
      searchParams?: Record<string, unknown>
    ) => {
      const { source, name } = optionsConfig;
      // We build the request query
      //#region For custom URL configurations, we attempt to build the final URL and update the
      // the resource entry if source property of the option configurations
      let { resource: url } = source;
      if (isCustomURL(url ?? '') && queriesConfig) {
        const { queries } = queriesConfig;
        const host =
          typeof queries && name
            ? resolveURLHost(queriesConfig, name, endpoint ?? '')
            : endpoint ?? '';
        url = customToResourceURL(url, host);
        url = url[0] === '/' ? url.substring(1) : url;
        optionsConfig = {
          ...optionsConfig,
          source: { ...(source ?? {}), resource: url },
        };
      }
      //#endregion
      const request = {
        ...optionsConfig,
        url: createRequestURL(optionsConfig, endpoint ?? ''),
        search: searchParams,
      };
      return _requestClient(
        request,
        injector,
        queriesConfig?.queries && name
          ? resolveRequestInterceptorFactory(queriesConfig, name)
          : queriesConfig?.interceptorFactory
      );
    },
  });
  return _requestClient as any as _OptionsRequestFunction & InputOptionsClient;
}

/**
 * function for querying options value from server
 *
 * @param optionsConfig
 * @param injector
 * @param interceptorFactory
 * @returns
 */
export function queryOptions(
  optionsConfig: OptionsQueryParams,
  injector: Injector,
  interceptorFactory?: InterceptorFactory<HTTPRequest>
) {
  const { source, url, search } = optionsConfig;
  let uri = url;
  let searchQuery = search ?? {};
  let body: Record<string, unknown> | undefined = undefined;

  if (isValidHttpUrl(source.resource)) {
    const query = new URL(source.resource).search;
    const params = Object.fromEntries(new URLSearchParams(query).entries());
    body = { ...params, ...searchQuery };
    uri = (url ?? source.resource).replace(`?${query}`, '');
  } else {
    body = { ...searchQuery, table_config: source.raw };
  }

  return rxRequest({
    url: uri,
    method: 'GET',
    body,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    responseType: 'json',
    interceptors: interceptorFactory ? [interceptorFactory(injector)] : [],
  }).pipe(map((state) => state.body));
}
