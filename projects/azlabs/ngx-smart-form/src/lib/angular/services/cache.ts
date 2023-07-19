import { Inject, Injectable, Optional } from '@angular/core';
import { BehaviorSubject, from, Observable, ObservableInput } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import {
  FormsLoader,
  groupControlsBy,
  setControlChildren,
  sortRawFormControls,
  FormInterface,
  CacheProvider
} from '@azlabsjs/smart-form-core';
import { FORMS_LOADER } from '../types';


@Injectable()
export class FormsCacheProvider implements CacheProvider {
  // @internal
  private readonly _cache = new BehaviorSubject<FormInterface[]>([]);

  /**
   * @decription Creates an instance of FormsCacheProvider class
   *
   * @param loader
   */
  constructor(
    @Inject(FORMS_LOADER) @Optional() private loader: FormsLoader
  ) {}

  /**
   *
   * @param id
   */
  get(id: string | number): Observable<FormInterface> {
    return this._cache.pipe(
      map(
        (state) =>
          state.find((x) => id.toString() === x.id.toString()) as FormInterface
      )
    );
  }

  /**
   *
   * @param values
   */
  getList(values: (string | number)[]): Observable<FormInterface[]> {
    const values_ = values.map((value: number | string) => value.toString());
    return this._cache.pipe(
      map((state) => state.filter((x) => values_.includes(x.id.toString())))
    );
  }

  // Cache handler method
  cache = (endpoint: string, options: { [index: string]: any } = {}) => {
    return from(
      this.loader.load(endpoint, options) as ObservableInput<FormInterface[]>
    ).pipe(
      tap((state) => {
        // TODO : Add the list of
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
    );
  };
}
