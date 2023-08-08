import { HTTPRequest, HTTPResponse, NextFunction } from '@azlabsjs/requests';

/**
 * Provide a default interceptor function that resolves selectable values using `data` keyword if it exist
 * in the response body or return the entire response body if the data object does not exists
 */
export function useOptionsInterceptor() {
  return (() => {
    // Replace the interceptor function by using the injector
    return async (
      request: HTTPRequest,
      next: NextFunction<
        HTTPRequest,
        HTTPResponse | Promise<HTTPResponse> | Promise<unknown> | unknown
      >
    ) => {
      const response = await (next(request) as Promise<HTTPResponse>);
      return response.clone({
        setBody: (body: Record<string, unknown>) => {
          if (typeof body === 'undefined' || body === null) {
            return [];
          }
          return body['data'] ?? body;
        },
      });
    };
  });
}
