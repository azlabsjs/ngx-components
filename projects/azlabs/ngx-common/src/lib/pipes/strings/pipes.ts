import {
  ChangeDetectorRef,
  Inject,
  Injectable,
  OnDestroy,
  Optional,
  Pipe,
  PipeTransform,
  untracked,
} from '@angular/core';
import { Observable, Subscribable, Unsubscribable, map, of } from 'rxjs';
import { COMMON_STRINGS } from './tokens';
import { getObjectProperty } from '@azlabsjs/js-object';
import { TranslationsType } from './types';

interface SubscriptionStrategy {
  createSubscription(
    async: Subscribable<any> | Promise<any>,
    updateLatestValue: any
  ): Unsubscribable | Promise<any>;
  dispose(subscription: Unsubscribable | Promise<any>): void;
}

class SubscribableStrategy implements SubscriptionStrategy {
  createSubscription(
    async: Subscribable<any>,
    updateLatestValue: any
  ): Unsubscribable {
    // Subscription can be side-effectful, and we don't want any signal reads which happen in the
    // side effect of the subscription to be tracked by a component's template when that
    // subscription is triggered via the async pipe. So we wrap the subscription in `untracked` to
    // decouple from the current reactive context.
    //
    // `untracked` also prevents signal _writes_ which happen in the subscription side effect from
    // being treated as signal writes during the template evaluation (which throws errors).
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
@Injectable({ providedIn: 'any' })
export class CommonTextPipe implements OnDestroy, PipeTransform {
  private _ref: ChangeDetectorRef | null;
  private _latestValue: any = null;
  private markForCheckOnValueUpdate = true;

  private _subscription: Unsubscribable | Promise<any> | null = null;
  private _lastQuery: string | null = null;
  private _strategy: SubscriptionStrategy | null = null;
  private _c: Observable<TranslationsType>;

  constructor(
    ref: ChangeDetectorRef,
    @Inject(COMMON_STRINGS)
    @Optional()
    _commonStrings: Observable<TranslationsType>
  ) {
    // Assign `ref` into `this._ref` manually instead of declaring `_ref` in the constructor
    // parameter list, as the type of `this._ref` includes `null` unlike the type of `ref`.
    this._ref = ref;
    this._c = _commonStrings ?? of({});
  }

  ngOnDestroy(): void {
    if (this._subscription) {
      this._dispose();
    }
    // Clear the `ChangeDetectorRef` and its association with the view data, to mitigate
    // potential memory leaks in Observables that could otherwise cause the view data to
    // be retained.
    // https://github.com/angular/angular/issues/17624
    this._ref = null;
  }

  // NOTE(@benlesh): Because Observable has deprecated a few call patterns for `subscribe`,
  // TypeScript has a hard time matching Observable to Subscribable, for more information
  // see https://github.com/microsoft/TypeScript/issues/43643
  transform(query: string, ns?: string, def?: string): string {
    if (!query || !query.length) {
      return def ?? '';
    }

    const _query = ns ? `${ns}.${query}` : `${query}`;
    if (!this._lastQuery) {
      if (query) {
        try {
          // Only call `markForCheck` if the value is updated asynchronously.
          // Synchronous updates _during_ subscription should not wastefully mark for check -
          // this value is already going to be returned from the transform function.
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
      return this.transform(query, ns, def);
    }

    return this._latestValue;
  }

  private _subscribe(q: string): void {
    this._lastQuery = q;
    this._strategy = _subscribableStrategy;
    const observable = this._c.pipe(
      map((value) => getObjectProperty(value, q))
    );
    this._subscription = this._strategy.createSubscription(
      observable,
      (value: Object) => this._updateLatestValue(q, value)
    );
  }

  private _dispose(): void {
    // Note: `dispose` is only called if a subscription has been initialized before, indicating
    // that `this._strategy` is also available.
    this._strategy!.dispose(this._subscription!);
    this._latestValue = null;
    this._subscription = null;
    this._lastQuery = null;
  }

  private _updateLatestValue(q: string, value: Object): void {
    if (q === this._lastQuery) {
      this._latestValue = value;
      if (this.markForCheckOnValueUpdate) {
        this._ref?.markForCheck();
      }
    }
  }
}

/** @deprecated Use `text` pipe instead */
@Pipe({
  name: 'commonString',
  pure: false,
  standalone: true,
})
@Injectable({ providedIn: 'any' })
export class CommonStringsPipe implements PipeTransform {
  /** @description strings pipe class constructor */
  constructor(private textPipe: CommonTextPipe) {}

  /** @description Redirect calls to text pipe transform method */
  transform(q: string, module?: string, def: string = '') {
    return this.textPipe.transform(q, module, def);
  }
}

@Pipe({
  name: 'asyncText',
  pure: true,
  standalone: true,
})
@Injectable({ providedIn: 'any' })
export class AsyncTextPipe implements PipeTransform {
  private _c: Observable<TranslationsType>;

  constructor(
    @Inject(COMMON_STRINGS)
    @Optional()
    _commonStrings: Observable<TranslationsType>
  ) {
    this._c = _commonStrings ?? of({});
  }

  transform(query: string, module?: string, def?: string): Observable<string> {
    if (!query || !query.length) {
      return of(def ?? '');
    }
    const q = module ? `${module}.${query}` : `${query}`;
    return this._c.pipe(map((value) => getObjectProperty(value, q))) as Observable<string>;
  }
}
