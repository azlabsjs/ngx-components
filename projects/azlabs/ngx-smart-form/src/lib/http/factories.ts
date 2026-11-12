import { lastValueFrom, map, Observable } from 'rxjs';
import { isValidURL, rxRequest } from '.';
import { LoadFormsRequestHandler } from '../angular/types';
import { LocationStrategy, PlatformLocation } from '@angular/common';
import { FormConfigInterface } from '@azlabsjs/smart-form-core';
import { ɵisPromise } from '@angular/core';

function buildUrl(location: LocationStrategy, platform: PlatformLocation, path: string) {
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

/** @internal factory function for creating default form loader instance */
export function useHTTPFormLoader(location: LocationStrategy, platform: PlatformLocation, options: { url: string, handler?: LoadFormsRequestHandler | undefined | null, interceptor?: (items: { [prop: string]: unknown }[]) => FormConfigInterface[] }) {
  const { handler, interceptor } = options;
  const fn = interceptor ?? ((items) => Array.isArray(items) ? items as FormConfigInterface[] : []);
  let { url } = options;
  url = isValidURL(url) ? url : buildUrl(location, platform, url);

  const reqHandler = handler ?? (() => {
    return rxRequest({
      url,
      method: 'GET',
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      responseType: 'json',
    }).pipe(map((response) => response.body as unknown as Record<string, unknown>[]));
  });



  return {
    load: async (options?: { [index: string]: any }): Promise<ReturnType<typeof fn>> => {
      const response = reqHandler(options);

      if (ɵisPromise(response)) {
        return fn(await response);
      }

      return lastValueFrom(response.pipe(map(fn)));
    }
  }

}
