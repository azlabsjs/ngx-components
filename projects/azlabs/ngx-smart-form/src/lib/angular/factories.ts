import { map } from 'rxjs';
import { isValidURL, rxRequest } from '../http';
import { LoadFormsRequestHandler } from './types';
import { FormsLoader } from './services';
import { LocationStrategy, PlatformLocation } from '@angular/common';

/** @internal Factory function for creating default form loader instance */
export function useHTTPFormLoader(
  _location: LocationStrategy,
  _platform: PlatformLocation,
  handler: LoadFormsRequestHandler | undefined
) {
  const _loadFormsHandler =
    handler ??
    ((url: string) => {
      return rxRequest({
        url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        responseType: 'json',
      }).pipe(
        map((response) => response.body as unknown as Record<string, unknown>[])
      );
    });
  return new FormsLoader(_loadFormsHandler, (path?: string) => {
    if (path && isValidURL(path)) {
      return path;
    }
    let { hostname, port } = _platform;
    port = port ? `:${port}` : '';
    hostname = hostname.endsWith('#')
      ? hostname.substring(0, hostname.length - 1)
      : hostname;
    const _base = `${_platform.protocol}//${hostname}${port}`;
    path = _location.prepareExternalUrl(path ?? '/');
    const _path = path.startsWith('#') ? path.substring(1) : path;
    const _hostname = _base.endsWith('/')
      ? _base.substring(0, _base.length - 1)
      : _base;
    const hostPath = _path.startsWith('/') ? _path.substring(1) : _path;

    // return the constructed url as an output
    return `${_hostname}/${hostPath}`;
  });
}
