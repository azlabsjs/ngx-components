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
import { filter, from, map, ObservableInput } from 'rxjs';
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
 * function for querying options value from server
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

/**
 * makes an http request using rxjs fetch wrapper
 *
 * **Note**
 * If no Content-Type header is provided to the request client
 * a default application/json content type is internally used
 * 
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

/** @internal */
function createQueryURL(url: string, config: OptionsConfig) {
  const { params } = config ?? {}
  if (!params) {
    return url;
  }

  let { filters: searchquery } = params;
  if (!searchquery) {
    return url;
  }

  const placeholders: [string, string][] = [['[[', ''], [']]', ''], ['{', ''], ['}', ''], ['|', '&']]
  for (const placeholder of placeholders) {
    searchquery = searchquery?.replace(...placeholder);
  }

  return searchquery ? `${url}?${searchquery}` : `${url}`;
}

/** @internal */
function createRequestURL(value: OptionsConfig, endpoint: string) {
  const url = value.source.resource;
  return isValidHttpUrl(url) ? createQueryURL(url, value) : `${endpoint}`;
}

/** @internal */
function resolveURLHost(
  queries: OptionsQueryConfigType['queries'],
  name: string,
  endpoint: string
) {
  if (queries) {
    const value = queries[name];
    if (value && typeof value === 'string') {
      return getHttpHost(value);
    }

    if (value && typeof value === 'function') {
      return value() ?? endpoint;
    }

    if (value && typeof value === 'object') {
      return typeof value.host === 'string' ? getHttpHost(value.host) : typeof value.host === 'function' ? value.host() : endpoint;
    }

    return endpoint;
  }
  return endpoint;
}

/** @internal */
function resolveInterceptorFactory(
  queries: OptionsQueryConfigType['queries'],
  name: string,
  factory?: OptionsQueryConfigType['interceptorFactory']
) {
  if (queries) {
    const value = queries[name];
    return typeof value === 'object' ? value.interceptor ?? factory : factory;
  }
  return factory;
}

/** @internal */
export function optionsQueryClient(
  injector: Injector,
  endpoint?: string,
  queriesConfig?: OptionsQueryConfigType
) {
  const fn = (config: OptionsQueryParams, injector: Injector, factory?: InterceptorFactory<HTTPRequest>) => queryOptions(config, injector, factory);

  Object.defineProperty(fn, 'request', {
    value: (
      config: OptionsConfig & { name?: string },
      search?: Record<string, unknown>
    ) => {

      const { source, name } = config;
      const { queries, interceptorFactory: factory } = queriesConfig ?? {}
      let { resource: url } = source;

      if (isCustomURL(url ?? '') && queriesConfig) {
        const host = queries && name ? resolveURLHost(queries, name, endpoint ?? '') : endpoint ?? '';
        url = customToResourceURL(url, host);
        url = url[0] === '/' ? url.substring(1) : url;
        config = { ...config, source: { ...(source ?? {}), resource: url } };
      }

      const request = { ...config, url: createRequestURL(config, endpoint ?? ''), search }
      console.log( 'Request: ', request);
      return fn(request, injector, queries && name ? resolveInterceptorFactory(queries, name, factory) : factory);
    },
    configurable: true,
    writable: true
  });
  return fn as any as _OptionsRequestFunction & InputOptionsClient;
}