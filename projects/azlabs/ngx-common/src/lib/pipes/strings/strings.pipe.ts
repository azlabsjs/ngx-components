import {
  ChangeDetectorRef,
  Inject,
  Optional,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { COMMON_STRINGS } from './tokens';
import { Observable, Subscription, map } from 'rxjs';
import { getObjectProperty } from '@azlabsjs/js-object';

@Pipe({
  name: 'commonString',
  pure: false,
})
export class CommonStringsPipe implements PipeTransform {
  // #region Class properties
  private _latestValue: string | unknown = '...';
  private _ref: ChangeDetectorRef | null;
  private _subscription!: Subscription | null;
  private _search!: string | null;
  // #endregion Class properties

  constructor(
    @Inject(COMMON_STRINGS)
    private commonStrings: Observable<Record<string, any>>,
    @Optional() ref: ChangeDetectorRef
  ) {
    this._ref = ref;
  }

  //
  private updateResult(query: string) {
    // Set the current search string to equals the search argument value
    this._search = query;

    this._subscription = this.commonStrings
      .pipe(map((value) => getObjectProperty(value, query)))
      .subscribe((result) => this._updateLatestValue(query, result));
  }

  private _updateLatestValue(search: string, value: unknown): void {
    if (search === this._search) {
      this._latestValue = value ?? '...';
      // Note: `this._ref` is only cleared in `ngOnDestroy` so is known to be available when a
      // value is being updated.
      this._ref?.markForCheck();
    }
  }

  private dispose() {
    if (this._subscription) {
      this._subscription.unsubscribe();
    }
    this._latestValue = null;
    this._subscription = null;
    this._search = null;
  }

  //
  transform(query: string, ns?: string, _default: string = '...'): any {
    const _query = ns
      ? `${ns.toString()}.${query.toString()}`
      : `${query.toString()}`;

    if (!this._search) {
      // if we ask another time for the same key, return the last value
      this.updateResult(_query);
      return this._latestValue ?? _default;
    }

    if (_query !== this._search) {
      this.dispose();
      // Fixed bug from previous versions which forget adding namespace
      // on consequent ns calls
      this.transform(query, ns, _default);
    }

    return this._latestValue ?? _default;
  }

  ngOnDestroy() {
    this.dispose();
    this._ref = null;
  }
}
