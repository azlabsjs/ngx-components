import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  FormsLoader,
  groupControlsBy,
  setControlChildren,
  sortRawFormControls,
  FormInterface,
  CacheProvider,
  ObservableInput,
} from '@azlabsjs/smart-form-core';
import { FORMS_LOADER } from '../tokens';

@Injectable({
  providedIn: 'root',
})
export class FormsCacheProvider implements CacheProvider {
  // @internal
  private readonly _cache = new BehaviorSubject<FormInterface[]>([]);

  /** @decription Creates an instance of FormsCacheProvider class */
  constructor(
    @Inject(FORMS_LOADER) @Optional() private loader?: FormsLoader | null
  ) {}

  get(id: string | number) {
    return this._cache.pipe(
      map(
        (state) =>
          state.find((x) => id.toString() === x.id.toString()) as FormInterface
      )
    );
  }

  getList(values: (string | number)[]) {
    const values_ = values.map((value: number | string) => value.toString());
    return this._cache.pipe(
      map((state) => state.filter((x) => values_.includes(x.id.toString())))
    );
  }

  cache(endpoint: string, options: { [index: string]: any } = {}) {
    const subscribable$ = this.loader?.load(endpoint, options) as
      | Observable<FormInterface[]>
      | undefined;
    const observable$ = subscribable$
      ? from(subscribable$).pipe(
          tap((state) => {
            this._cache.next(
              state
                ? state.map((current) =>
                    sortRawFormControls(
                      setControlChildren(current)(groupControlsBy)
                    )
                  )
                : state
            );
          })
        )
      : of();

    return observable$ as
      | ObservableInput<FormInterface[]>
      | ObservableInput<never>;
  }
}
