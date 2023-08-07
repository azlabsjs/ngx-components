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
        // withCredentials: true,
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
      let _endpoint: string | undefined = endpoint;
      const { source, name } = optionsConfig;
      // We build the request query
      //#region For custom URL configurations, we attempt to build the final URL and update the
      // the resource entry if source property of the option configurations
      let url = source.resource;
      if (isCustomURL(url ?? '')) {
        const hostConfig =
          typeof queriesConfig?.queries !== 'undefined' &&
          queriesConfig?.queries !== null &&
          typeof name !== 'undefined' &&
          name !== null
            ? resolveURLHost(queriesConfig, name, _endpoint ?? '')
            : _endpoint ?? '';
        url = customToResourceURL(url, hostConfig);
        url = url[0] === '/' ? url.substring(1) : url;
        optionsConfig = {
          ...optionsConfig,
          source: { ...(source ?? {}), resource: url },
        };
      }
      //#endregion
      const request = {
        ...optionsConfig,
        url: createRequestURL(optionsConfig, _endpoint ?? ''),
        searchParams,
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
  // We provides a request body only if the resource object is not a valid
  // HTTP URI because in such case the request is being send to form API server
  // instead of any resource server
  const body = isValidHttpUrl(source.resource)
    ? typeof search !== 'undefined' && search !== null
      ? search
      : undefined
    : typeof search !== 'undefined' && search !== null
    ? {
        ...search,
        table_config: source.raw,
      }
    : {
        table_config: source.raw,
      };
  return rxRequest({
    url,
    method: 'GET',
    body,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    responseType: 'json',
    interceptors: interceptorFactory ? [interceptorFactory(injector)] : [],
  }).pipe(map((state) => state.body));
}
