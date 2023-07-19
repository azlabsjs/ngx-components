import { Inject, Injectable } from '@angular/core';
import { from, Observable, ObservableInput } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  buildFormSync,
  CacheProvider,
  FormConfigInterface,
  FormInterface,
} from '@azlabsjs/smart-form-core';
import { CACHE_PROVIDER, FormsClient } from '../types';

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

  get(id: string | number): Observable<FormConfigInterface> {
    return from(this.provider.get(id) as ObservableInput<FormInterface>).pipe(
      map((state) => buildFormSync(state) as FormConfigInterface)
    );
  }

  getAll(list: (string | number)[]): Observable<FormConfigInterface[]> {
    return from(
      this.provider.getList(list) as ObservableInput<FormInterface[]>
    ).pipe(
      map(
        (state) =>
          state
            .map((current) => buildFormSync(current))
            .filter(
              (current) => typeof current !== 'undefined' && current !== null
            ) as FormConfigInterface[]
      )
    );
  }
}
