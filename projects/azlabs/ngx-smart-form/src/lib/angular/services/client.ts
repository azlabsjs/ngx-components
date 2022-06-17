import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CacheProvider,
  DynamicFormHelpers,
  FormsClient,
  IDynamicForm,
} from '../../core';
import { CACHE_PROVIDER } from './cache';
import { map } from 'rxjs/operators';

@Injectable()
export class JSONFormsClient implements FormsClient {

  /**
   * @description Creates an instance of JSONFormsClient class
   *
   * @param provider
   */
  constructor(
    @Inject(CACHE_PROVIDER)
    private provider: CacheProvider
  ) {}

  get(id: string | number): Observable<IDynamicForm> {
    return this.provider
      .get(id)
      .pipe(map((state) => DynamicFormHelpers.buildFormSync(state)));
  }

  getAll(list: (string | number)[]): Observable<IDynamicForm[]> {
    return this.provider
      .getList(list)
      .pipe(
        map((state) =>
          state.map((current) => DynamicFormHelpers.buildFormSync(current))
        )
      );
  }
}
