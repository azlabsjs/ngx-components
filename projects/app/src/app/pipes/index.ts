import { HttpClient } from '@angular/common/http';
import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { as, QueryStateType, useQuery } from '@azlabsjs/rx-query';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { TranslateService } from '@ngx-translate/core';
import { catchError, distinctUntilChanged, EMPTY, filter, map, Observable } from 'rxjs';

@Pipe({
    name: 'testPipe',
    standalone: true
})
@Injectable({ providedIn: 'root' })
export class TestPipe implements PipeTransform {
  transform(value: any) {
    return `******${value}******`;
  }
}


@Injectable({ providedIn: 'root' })
@Pipe({
  name: 'asyncTranslate',
  standalone: true,
  pure: true,
})
export class AsyncTranslatePipe implements PipeTransform {
  constructor(private translate: TranslateService) {}
  transform(value: any, args: Record<string, unknown>) {
    return this.translate.get(value, args).pipe(distinctUntilChanged());
  }
}

/** @internal */
export function createHTTPValueQuery(client: HttpClient,url: string,select: string,param?: string) {
  const _url = param ? `${url.endsWith('/') ? url.substring(0, url.length - 1) : url}/${param}?_columns[]=${select}&_hidden[]=id` : `${url}?_columns[]=${select}&_hidden[]=id`;
  const response$ = as<Observable<QueryStateType>>(
    useQuery(
      () => {
        return client
          .request('GET', _url, { responseType: 'json' })
          .pipe(
            catchError(() => EMPTY),
            map((response: any) => response[select])
          );
      },
      {
        name: url,
        cacheTime: 1000 * 60 * 5,
        refetchInterval: 1000 * 60 * 6,
        cacheQuery: true,
      }
    )
  ).pipe(
    filter((value: QueryStateType) => typeof value.response != 'undefined' && value.response != null),
    map((value) => value.response)
  );
  return response$;
}

@Injectable({ providedIn: 'root' })
@Pipe({
  name: 'httpValue',
  pure: true,
  standalone: true,
})
export class HTTPValuePipe implements PipeTransform {
  constructor(private http: HttpClient) {}

  transform(param: string, url: string, select: string) {
    return createHTTPValueQuery(this.http, url, select, param);
  }
}


@Pipe({
  name: 'required',
  pure: true,
  standalone: true,
})
export class RequiredPipe implements PipeTransform {
  transform(value: InputConfigInterface) {
    return !!value.constraints && 'required' in value.constraints && !!value.constraints.required;
  }
}