import {
  ChangeDetectorRef,
  Inject,
  OnDestroy,
  Optional,
  Pipe,
  PipeTransform,
  untracked,
} from '@angular/core';
import { Subscribable, Unsubscribable, map, of } from 'rxjs';
import { compile, equals } from './internal';
import { Translations } from '../../types';
import { TRANSLATIONS_DICTIONARY } from '../../tokens';
import { defaultStrings } from '../../constants';

/** @internal */
type ObjType = { [index: string]: unknown };

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

/** @internal */
const INVALID_PARAMETER_MESSAGE = `Wrong parameter in TranslatePipe. Expected a valid Object, received`;

/**
 * @ngModule CommonModule
 * @description
 *
 * @publicApi
 */
@Pipe({
  name: 'translate',
  pure: false,
  standalone: true,
})
export class TranslatePipe implements OnDestroy, PipeTransform {
  private _ref: ChangeDetectorRef | null;
  private _latestValue: any = null;
  private markForCheckOnValueUpdate = true;

  private _subscription: Unsubscribable | Promise<any> | null = null;
  private _lastQuery: string | null = null;
  private _lastArgs: any[] | null = null;
  private _strategy: SubscriptionStrategy | null = null;
  private translations: Translations;

  constructor(
    ref: ChangeDetectorRef,
    @Inject(TRANSLATIONS_DICTIONARY)
    @Optional()
    _translations?: Translations
  ) {
    // Assign `ref` into `this._ref` manually instead of declaring `_ref` in the constructor
    // parameter list, as the type of `this._ref` includes `null` unlike the type of `ref`.
    this._ref = ref;
    this.translations = _translations ?? of(defaultStrings);
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
  transform(query: string, ...args: any[]): string {
    if (!query || !query.length) {
      return query;
    }

    if (!this._lastQuery) {
      if (query) {
        try {
          // Only call `markForCheck` if the value is updated asynchronously.
          // Synchronous updates _during_ subscription should not wastefully mark for check -
          // this value is already going to be returned from the transform function.
          this.markForCheckOnValueUpdate = false;
          let interpolate: { [index: string]: unknown } | null = null;
          if (
            !(typeof args[0] === 'undefined' || args[0] === null) &&
            args.length
          ) {
            if (typeof args[0] === 'string' && args[0].length) {
              // we accept objects written in the template such as {n:1}, {'n':1}, {n:'v'}
              // which is why we might need to change it to real JSON objects such as {"n":1} or {"n":"v"}
              let validArgs: string = args[0]
                .replace(/(\')?([a-zA-Z0-9_]+)(\')?(\s)?:/g, '"$2":')
                .replace(/:(\s)?(\')(.*?)(\')/g, ':"$3"');
              try {
                interpolate = JSON.parse(validArgs);
              } catch (e) {
                throw new SyntaxError(
                  `${INVALID_PARAMETER_MESSAGE}: ${args[0]}`
                );
              }
            } else if (typeof args[0] === 'object' && !Array.isArray(args[0])) {
              interpolate = args[0];
            }
          }
          this._subscribe(query, args, interpolate);
        } finally {
          this.markForCheckOnValueUpdate = true;
        }
      }
      return this._latestValue;
    }

    if (!equals(query, this._lastQuery) || !equals(args, this._lastArgs)) {
      this._dispose();
      return this.transform(query, args);
    }

    return this._latestValue;
  }

  private translate(q: string | string[], interpolateParams: ObjType) {
    const keys = Array.isArray(q) ? q : [q];
    const fn = (state: ObjType) => {
      return (key: string) => compile(state, key, interpolateParams ?? {});
    };
    return this.translations.pipe(map((state) => keys.map(fn(state))[0]));
  }

  private _subscribe(
    q: string,
    args: any[],
    interpolate: ObjType | null
  ): void {
    this._lastQuery = q;
    this._lastArgs = args;
    this._strategy = _subscribableStrategy;
    const observable = this.translate(q, interpolate ?? {});
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
