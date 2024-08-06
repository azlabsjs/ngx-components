import { Injector } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Observable, distinctUntilChanged, filter, map, take } from 'rxjs';

/** @description Provides application texts from @ngx-tranlate/core library */
export function useTranslationsFactory<TReturn>(
  onLang?: (values: Record<string, any>) => TReturn
) {
  return (i: Injector) => {
    const t = i.get(TranslateService);
    onLang = onLang ?? ((v) => v as TReturn);
    const o =
      typeof t === 'undefined' || t === null
        ? new Observable<Record<string, any>>()
        : new Observable<Record<string, any>>((subscriber) => {
            // Subscribe to translation service
            const s1 = t
              .use(t.currentLang ?? t.getDefaultLang())
              .pipe(
                filter((values) => Object.keys(values ?? {}).length > 0),
                take(1)
                // tap(console.log)
              )
              .subscribe({
                next(values) {
                  subscriber.next(values);
                },
              });

            // Subscribe to translation change event
            const s2 = t.onLangChange.subscribe({
              next(e: LangChangeEvent) {
                subscriber.next(e.translations);
              },
              error(error: unknown) {
                subscriber.error(error);
              },
              complete() {
                subscriber.complete();
              },
            });

            return () => {
              for (const s of [s1, s2]) {
                s?.unsubscribe();
              }
            };
          });

    return o.pipe(distinctUntilChanged(), map(onLang));
  };
}
