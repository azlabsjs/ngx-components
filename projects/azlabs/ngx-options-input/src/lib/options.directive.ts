import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Optional,
  Output,
} from '@angular/core';
import {
  InputOptions,
  isCustomURL,
  isValidHttpUrl,
  mapIntoInputOptions,
  mapStringListToInputOptions,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { Subject, from, lastValueFrom, of } from 'rxjs';
import { debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
import {
  InputOptionsClient,
  ObservableOptionsConfig,
  OptionsConfigType,
  QueryType,
  Subscribable,
  KeyType as _KeyType,
  Subscription,
} from './types';
import { INPUT_OPTIONS_CLIENT, OPTIONS_CACHE } from './tokens';
import { CacheType } from './cache';

/** @internal */
type ObservationOptions = {
  root: HTMLElement;
  rootMargin: string;
  threshold: number;
};

/** @description Creates a browser intersection observer instance */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: ObservationOptions | undefined
) {
  return new IntersectionObserver(callback, options);
}

function isresource(source: OptionsConfig['source']) {
  if (!source) {
    return false;
  }
  const { resource, raw } = source;
  return (
    isCustomURL(resource) ||
    isValidHttpUrl(resource) ||
    (raw.match(/table:/) && raw.match(/keyfield:/))
  );
}

function isobservable(o: OptionsConfigType): o is ObservableOptionsConfig {
  return (
    typeof o === 'object' &&
    o !== null &&
    'refetch' in o &&
    'refetch' in o &&
    typeof o['refetch'] === 'object' &&
    typeof (o['refetch'] as ObservableOptionsConfig['refetch']).subscribe ===
      'function'
  );
}

@Directive({
  standalone: true,
  selector: '[fetchOptions]',
})
export class FetchOptionsDirective implements AfterViewInit, OnDestroy {
  //#region directive inputs
  @Input() loaded!: boolean;
  @Input() name!: string;
  @Input() auto: boolean = true;
  @Input({ alias: 'query' }) search: string = 'label';
  @Input({ alias: 'limit' }) limit!: number;
  private _options!: OptionsConfigType | undefined;
  @Input({ alias: 'config' }) set options(
    value: OptionsConfigType | undefined
  ) {
    this._options = value;
    if (value && isobservable(value)) {
      this.observable = value.refetch;
    }
  }
  get options() {
    return this._options;
  }
  //#endregion

  //#region directive outputs
  @Output() optionsChange = new EventEmitter<InputOptions>();
  @Output() loadingChange = new EventEmitter<boolean>();
  //#endregion

  // directive properties
  private observer!: IntersectionObserver;
  search$ = new Subject<
    [_KeyType, Omit<OptionsConfigType, 'refetch'>, QueryType]
  >();
  private subscriptions: Subscription[] = [];
  private observable!: Subscribable<{ [k: string]: unknown }>;

  // directive constructor
  constructor(
    private elemRef: ElementRef,
    @Inject(INPUT_OPTIONS_CLIENT) private client: InputOptionsClient,
    @Inject(DOCUMENT) private document: Document,
    @Inject(OPTIONS_CACHE)
    @Optional()
    private cache: CacheType<Record<string, unknown>, InputOptions>
  ) {
    this.subscriptions.push(
      this.search$
        .asObservable()
        .pipe(
          debounceTime(500),
          switchMap(([key, options, params]) => {
            const result = this.cache.get(key);
            return result
              ? of({ key, params, options, values: result })
              : from(this.sendRequest(options as OptionsConfig, params)).pipe(
                  map((values) => ({ key, params, options, values }))
                );
          }),
          tap((state) => {
            const { key, options, params, values } = state;
            // put value into cache and configure the update fonction to equal
            this.cache.put(key, values, (_values) => {
              return this.sendRequest(options as OptionsConfig, params);
            });
            this.loadingChange.emit(false);
            this.optionsChange.emit(values);
          })
        )
        .subscribe()
    );
  }

  ngAfterViewInit() {
    if (this.auto) {
      const { defaultView } = this.document ?? ({} as Document);
      const view = defaultView as any;
      // if intersection API is missing we execute the load query
      // When the view initialize
      view &&
      !('IntersectionObserver' in view) &&
      !('IntersectionObserverEntry' in view) &&
      !('intersectionRatio' in view.IntersectionObserverEntry.prototype)
        ? this.query()
        : this.observeView();
    }

    // subscribe to observable
    if (this.observable) {
      const subscription = this.observable.subscribe((value) => {
        this.fetch(undefined, value);
      });

      this.subscriptions.push(subscription);
    }
  }

  /** @internal a private API method that might not be used externally */
  async query() {
    const { loaded, options } = this;
    if (loaded || typeof options === 'undefined' || options === null) {
      return;
    }

    this.loadingChange.emit(true);

    const { source } = options;
    if (isresource(source)) {
      return this.fetchAsync(options);
    }

    return this.fetchSync(options);
  }

  fetch(value?: string, query?: { [k: string]: unknown }) {
    const { options, search } = this;
    if (typeof options !== 'undefined' && options !== null) {
      this.loadingChange.emit(true);
      let queryParam = query ?? {};
      if (value) {
        queryParam[search] = value;
      }

      this.fetchAsync(options, queryParam);
    }
  }

  private observeView() {
    if (this.observer) {
      this.observer.disconnect();
    }
    // we create an intersection observer that execute
    // load query when the html element is intersecting
    this.observer = createIntersectionObserver((entries, _) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.query();
        }
      });
    });

    this.observer.observe(this.elemRef.nativeElement);
  }

  private fetchSync(options: OptionsConfigType) {
    options;
    this.loadingChange.emit(false);
    this.optionsChange.emit(mapStringListToInputOptions(options.source.raw));
  }

  /** @interal */
  private async fetchAsync(
    options: OptionsConfigType,
    params: Record<string, unknown> = {}
  ) {
    const query =
      typeof this.limit !== 'undefined' && this.limit !== null
        ? { page: 1, per_page: this.limit, ...params }
        : { ...params };
    const { refetch, ...rest } = options;
    const key = { ...rest, ...params };

    // dispatch search query
    this.search$.next([key, rest, query]);
  }

  private sendRequest(options: OptionsConfig, params: Record<string, unknown>) {
    return lastValueFrom(
      this.client.request({ ...options, name: this.name }, params).pipe(
        first(),
        map((state) => {
          return state
            ? mapIntoInputOptions(
                options,
                state as unknown as Record<string, unknown>[]
              )
            : [];
        })
      )
    );
  }

  ngOnDestroy(): void {
    // disconnect from the observer
    this.observer?.disconnect();

    for (const subscripton of this.subscriptions) {
      subscripton.unsubscribe();
    }
  }
}
