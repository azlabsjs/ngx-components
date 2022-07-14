import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';
import { first, tap } from 'rxjs/operators';
import {
  InputOption,
  InputOptionsInterface,
  isValidHttpUrl,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { createIntersectionObserver } from '../helpers';
import { INPUT_OPTIONS_CLIENT } from '../types';
import { InputOptionsClient } from '../types/options';
import { lastValueFrom } from 'rxjs';
import { getObjectProperty } from '@azlabsjs/js-object';

// @internal
export function basicInputOptions(values: string[] | string) {
  const _values =
    typeof values === 'string' ? values.split('|') : (values as string[]);
  return _values?.map((current) => {
    if (current.indexOf(':') !== -1) {
      const state = current.split(':');
      return {
        value: state[0].trim(),
        description: state[1].trim(),
        name: state[1].trim(),
      } as InputOption;
    } else {
      return {
        value: isNaN(+current.trim()) ? current.trim() : +current.trim(),
        description: current.trim(),
        name: current.trim(),
      } as InputOption;
    }
  });
}

// @internal
export function mapIntoInputOptions(
  optionsConfig: OptionsConfig,
  values: Record<string, any>[]
) {
  return values
    ? values.map((current) => {
        return {
          value: getObjectProperty(current, optionsConfig.params?.keyBy || ''),
          description: getObjectProperty(
            current,
            optionsConfig.params?.valueBy || ''
          ),
          name: getObjectProperty(current, optionsConfig.params?.valueBy || ''),
          type:
            optionsConfig.params?.groupBy &&
            optionsConfig.params?.keyBy !== optionsConfig.params?.groupBy &&
            optionsConfig.params?.valueBy !== optionsConfig.params?.groupBy
              ? current[optionsConfig.params?.groupBy]
              : undefined,
        } as InputOption;
      })
    : [];
}

@Directive({
  selector: '[prefetchOptions]',
})
export class FetchOptionsDirective implements AfterViewInit, OnDestroy {
  //#region Directive inputs
  @Input() loaded!: boolean;
  @Input() optionsConfig!: OptionsConfig | undefined;
  //#endregion Directive inputs

  //#region Directive outputs
  @Output() loadedChange = new EventEmitter<boolean>();
  @Output() optionsChange = new EventEmitter<InputOptionsInterface>();
  @Output() loadingChange = new EventEmitter<boolean>();
  //#endregion Directive outputs

  // Directive properties
  private observer!: IntersectionObserver;

  // Directive constructor
  constructor(
    private elemRef: ElementRef,
    @Inject(INPUT_OPTIONS_CLIENT) private client: InputOptionsClient
  ) {}

  ngAfterViewInit() {
    if (
      !('IntersectionObserver' in window) &&
      !('IntersectionObserverEntry' in window) &&
      !('intersectionRatio' in window.IntersectionObserverEntry.prototype)
    ) {
      // If The intersection API is missing we execute the load query
      // When the view initialize
      this.executeQuery();
    } else {
      if (this.observer) {
        this.observer.disconnect();
      }
      // We create an intersection observer that execute load query
      // when the HTML element is intersecting
      this.observer = createIntersectionObserver((entries, _) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.executeQuery();
          }
        });
      });
      this.observer.observe(this.elemRef.nativeElement);
    }
  }

  async executeQuery() {
    if (
      this.loaded ||
      typeof this.optionsConfig === 'undefined' ||
      this.optionsConfig === null
    ) {
      return;
    }
    this.loadingChange.emit(true);
    if (
      isValidHttpUrl(this.optionsConfig.source.resource) ||
      (this.optionsConfig.source.raw.match(/table:/) &&
        this.optionsConfig.source.raw.match(/keyfield:/))
    ) {
      return this.asyncFetch(this.optionsConfig);
    }
    return this.syncFetch(this.optionsConfig);
  }

  private syncFetch(optionsConfig: OptionsConfig) {
    const options = basicInputOptions(optionsConfig.source.raw);
    this.loadingChange.emit(false);
    this.optionsChange.emit(options);
  }

  private async asyncFetch(optionsConfig: OptionsConfig) {
    await lastValueFrom(
      this.client.request(optionsConfig).pipe(
        first(),
        tap((state) => {
          this.loadingChange.emit(false);
          if (state) {
            this.optionsChange.emit(mapIntoInputOptions(optionsConfig, state));
          }
        })
      )
    );
  }

  ngOnDestroy(): void {
    // Disconnect from the observer
    this.observer.disconnect();
  }
}
