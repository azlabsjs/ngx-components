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
import { Subject, Subscription, from, lastValueFrom, of } from 'rxjs';
import { debounceTime, first, map, switchMap, tap } from 'rxjs/operators';
import { InputOptionsClient } from './types';
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

@Directive({
  standalone: true,
  selector: '[fetchOptions]',
})
export class FetchOptionsDirective implements AfterViewInit, OnDestroy {
  //#region directive inputs
  @Input() loaded!: boolean;
  @Input({ alias: 'config' }) options!: OptionsConfig | undefined;
  @Input() name!: string;
  @Input() auto: boolean = true;
  @Input({ alias: 'query' }) search: string = 'label';
  @Input({ alias: 'limit' }) limit!: number;
  //#endregion

  //#region directive outputs
  @Output() optionsChange = new EventEmitter<InputOptions>();
  @Output() loadingChange = new EventEmitter<boolean>();
  //#endregion

  // directive properties
  private observer!: IntersectionObserver;
  _search$ = new Subject<[Record<string, unknown>, OptionsConfig]>();
  private _subscriptions: Subscription[] = [];

  // Directive constructor
  constructor(
    private elemRef: ElementRef,
    @Inject(INPUT_OPTIONS_CLIENT) private client: InputOptionsClient,
    @Inject(DOCUMENT) private document: Document,
    @Inject(OPTIONS_CACHE)
    @Optional()
    private cache: CacheType<Record<string, unknown>, InputOptions>
  ) {
    this._subscriptions.push(
      this._search$
        .asObservable()
        .pipe(
          debounceTime(500),
          switchMap(([params, options]) => {
            const key: Record<string, unknown> = { ...options, ...params };
            const result = this.cache.get(key);
            return result
              ? of({ key, params, options, values: result })
              : from(this.sendRequest(options, params)).pipe(
                  map((values) => ({ key, params, options, values }))
                );
          }),
          tap((state) => {
            const { key, options, params, values } = state;
            // Put value into cache and configure the update fonction to equal
            this.cache.put(key, values, (_values) => {
              return this.sendRequest(options, params);
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
      // If The intersection API is missing we execute the load query
      // When the view initialize
      view &&
      !('IntersectionObserver' in view) &&
      !('IntersectionObserverEntry' in view) &&
      !('intersectionRatio' in view.IntersectionObserverEntry.prototype)
        ? this.query()
        : this.observeView();
    }
  }

  /**
   * @internal a private API method that might not be used externally
   */
  async query() {
    if (
      this.loaded ||
      typeof this.options === 'undefined' ||
      this.options === null
    ) {
      return;
    }
    this.loadingChange.emit(true);
    return isCustomURL(this.options.source.resource) ||
      isValidHttpUrl(this.options.source.resource) ||
      (this.options.source.raw.match(/table:/) &&
        this.options.source.raw.match(/keyfield:/))
      ? this.fetchAsync(this.options)
      : this.fetchSync(this.options);
  }

  fetch(value?: string) {
    if (typeof this.options !== 'undefined' && this.options !== null) {
      this.loadingChange.emit(true);
      this.fetchAsync(this.options, value ? { [this.search]: value } : {});
    }
  }

  private observeView() {
    if (this.observer) {
      this.observer.disconnect();
    }
    // We create an intersection observer that execute load query
    // when the HTML element is intersecting
    this.observer = createIntersectionObserver((entries, _) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.query();
        }
      });
    });
    this.observer.observe(this.elemRef.nativeElement);
  }

  private fetchSync(options: OptionsConfig) {
    this.loadingChange.emit(false);
    this.optionsChange.emit(mapStringListToInputOptions(options.source.raw));
  }

  /** @interal */
  private async fetchAsync(
    options: OptionsConfig,
    params: Record<string, unknown> = {}
  ) {
    this._search$.next([
      typeof this.limit !== 'undefined' && this.limit !== null
        ? { page: 1, per_page: this.limit, ...params }
        : { ...params },
      options,
    ]);
  }

  /** @internal */
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
    // Disconnect from the observer
    this.observer?.disconnect();

    for (const subscripton of this._subscriptions) {
      subscripton.unsubscribe();
    }
  }
}
