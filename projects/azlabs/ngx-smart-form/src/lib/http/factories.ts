import { map } from 'rxjs';
import { isValidURL, rxRequest } from '.';
import { LoadFormsRequestHandler } from '../angular/types';
import { LocationStrategy, PlatformLocation } from '@angular/common';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';

/** @internal factory function for creating default form loader instance */
export function useHTTPFormLoader(location: LocationStrategy, platform: PlatformLocation, handler?: LoadFormsRequestHandler | undefined, interceptor?: (items: { [prop: string]: unknown }[]) => FormConfigInterface[]) {
  const reqHandler = handler ?? ((url: string) => {
    return rxRequest({
      url,
      method: 'GET',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      responseType: 'json',
    }).pipe(map((response) => response.body as unknown as Record<string, unknown>[]));
  });


  function buildUrl(path: string) {
    if (path && isValidURL(path)) {
      return path;
    }

    let { hostname, port } = platform;
    port = port ? `:${port}` : '';
    hostname = hostname.endsWith('#') ? hostname.substring(0, hostname.length - 1) : hostname;
    const origin = `${platform.protocol}//${hostname}${port}`;
    path = location.prepareExternalUrl(path ?? '/');
    const _path = path.startsWith('#') ? path.substring(1) : path;
    const _hostname = origin.endsWith('/') ? origin.substring(0, origin.length - 1) : origin;
    const hostPath = _path.startsWith('/') ? _path.substring(1) : _path;

    return `${_hostname}/${hostPath}`;
  }

  return {
    load(endpoint: string, options?: { [index: string]: any }) {
      return reqHandler(isValidURL(endpoint) ? endpoint : buildUrl(endpoint), options).pipe(
        map(interceptor ?? ((items) => Array.isArray(items) ? items : [])),
      );
    }
  }

}
