import { Injector } from '@angular/core';
import { JSObject } from '@azlabsjs/js-object';
import { TranslateService } from '@ngx-translate/core';
import {
  Observable,
  Subscriber,
  Subscription,
  filter,
  map,
  mergeMap,
  take,
} from 'rxjs';

export function useTranslationsFactory<T extends { [k: string]: any }>() {
  // creates a singleton observable in the context of the factory function
  let o: Observable<T> | null = null;
  let completed: boolean = false;
  let subscription: Subscription | null = null;

  function createEffect(
    t: TranslateService,
    lang: string,
    callback: (values: { [k: string]: any } | T) => T
  ) {
    return (subscriber: Subscriber<T>) => {
      t.use(lang)
        .pipe(
          map((values) => Object.keys(JSObject.flatten(values))),
          filter((values) => values.length > 0),
          take(1),
          mergeMap((values) =>
            t.get(values).pipe(
              map((items) => {
                const output: T = {} as T;
                for (const [k, v] of Object.entries(items)) {
                  JSObject.setProperty(output, k, v);
                }
                return output;
              })
            )
          ),
          map(callback)
        )
        .subscribe(subscriber.next.bind(subscriber));
    };
  }

  return (callback?: (values: { [k: string]: any } | T) => T) => {
    let c = callback ? callback : (v: { [k: string]: any } | T) => v as T;
    return (injector: Injector) => {
      if (typeof o === 'undefined' || o === null) {
        o = new Observable((subscriber) => {
          const t = injector.get(TranslateService);

          if (t) {
            // creates an effect which query translations for when observable initialize
            createEffect(t, t.currentLang ?? t.getDefaultLang(), c)(subscriber);

            // listen for language change to update common texts until the common test observable finalizes
            subscription = t.onLangChange
              .pipe(map((lang) => c(lang.translations)))
              .subscribe({
                next: subscriber.next.bind(subscriber),
                complete: () => {
                  completed = true;
                },
              });
          }

          return () => {
            if (completed && subscription) {
              subscription.unsubscribe();
            }
          };
        });
      }

      return o as Observable<T>;
    };
  };
}
