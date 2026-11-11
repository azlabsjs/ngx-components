import { ChangeDetectorRef, Inject, Injectable, OnDestroy, Optional, Pipe, PipeTransform, untracked } from '@angular/core';
import { Observable, Subscribable, Unsubscribable, map, of } from 'rxjs';
import { COMMON_STRINGS } from './tokens';
import { getObjectProperty } from '@azlabsjs/js-object';
import { TranslationsType } from './types';

interface SubscriptionStrategy {
  createSubscription(async: Subscribable<any> | Promise<any>, updateLatestValue: any): Unsubscribable | Promise<any>;
  dispose(subscription: Unsubscribable | Promise<any>): void;
}

class SubscribableStrategy implements SubscriptionStrategy {
  createSubscription(async: Subscribable<any>, updateLatestValue: any): Unsubscribable {
    return untracked(() =>
      async.subscribe({
        next: updateLatestValue,
        error: (e: any) => {
          throw e;
        },
      })
    );
  }

  dispose(subscription: Unsubscribable): void {
    // See the comment in `createSubscription` above on the use of `untracked`.
    untracked(() => subscription.unsubscribe());
  }
}

/** @internal */
const _subscribableStrategy = new SubscribableStrategy();

/**
 * @ngModule NgxCommonModule
 *
 * @publicApi
 */
@Pipe({
  name: 'text',
  pure: false,
  standalone: true,
})
@Injectable()
export class CommonTextPipe implements OnDestroy, PipeTransform {
  private _latestValue: any = null;
  private markForCheckOnValueUpdate = true;

  private _subscription: Unsubscribable | Promise<any> | null = null;
  private _lastQuery: string | null = null;
  private _strategy: SubscriptionStrategy | null = null;
  private _c: Observable<TranslationsType>;

  constructor(@Optional() private ref: ChangeDetectorRef | null, @Inject(COMMON_STRINGS) @Optional() _commonStrings: Observable<TranslationsType>) {
    this._c = _commonStrings ?? of({});
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._dispose();
    }

    this.ref = null;
  }

  transform(query: string, prefix?: string, def?: string): string {
    if (!query || !query.length) {
      return def ?? '';
    }

    const _query = prefix ? `${prefix}.${query}` : `${query}`;
    if (!this._lastQuery) {
      if (query) {
        try {
          this.markForCheckOnValueUpdate = false;
          this._subscribe(_query);
        } finally {
          this.markForCheckOnValueUpdate = true;
        }
      }
      return this._latestValue ?? def ?? query;
    }

    if (_query !== this._lastQuery) {
      this._dispose();
      return this.transform(query, prefix, def);
    }

    return this._latestValue ?? def ?? query;
  }

  private _subscribe(q: string): void {
    this._lastQuery = q;
    this._strategy = _subscribableStrategy;
    const observable = this._c.pipe(
      map((value) => getObjectProperty(value, q))
    );
    this._subscription = this._strategy.createSubscription(observable, (value: Object) => this._updateLatestValue(q, value));
  }

  private _dispose(): void {
    this._strategy!.dispose(this._subscription!);
    this._latestValue = null;
    this._subscription = null;
    this._lastQuery = null;
  }

  private _updateLatestValue(q: string, value: Object): void {
    if (q === this._lastQuery) {
      this._latestValue = value;
      if (this.markForCheckOnValueUpdate) {
        this.ref?.markForCheck();
      }
    }
  }
}

@Pipe({
  name: 'asyncText',
  pure: true,
  standalone: true,
})
@Injectable()
export class AsyncTextPipe implements PipeTransform {
  private translations: Observable<TranslationsType>;

  constructor(@Inject(COMMON_STRINGS) @Optional() translations: Observable<TranslationsType>) {
    this.translations = translations ?? of({});
  }

  transform(query: string, prefix?: string, def?: string): Observable<string> {
    if (!query || !query.length) {
      return of(def ?? '');
    }
    const q = prefix ? `${prefix}.${query}` : `${query}`;
    return this.translations.pipe(
      map((value) => getObjectProperty(value, q) ?? def)
    ) as Observable<string>;
  }
}
