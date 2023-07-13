import { DOCUMENT } from '@angular/common';
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
import {
  InputOptionsInterface,
  isCustomURL,
  isValidHttpUrl,
  mapIntoInputOptions,
  mapStringListToInputOptions,
  OptionsConfig,
} from '@azlabsjs/smart-form-core';
import { lastValueFrom } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { InputOptionsClient } from './types';
import { createIntersectionObserver } from './observers';
import { INPUT_OPTIONS_CLIENT } from './tokens';

@Directive({
  selector: '[fetchOptions]',
})
export class FetchOptionsDirective implements AfterViewInit, OnDestroy {
  //#region Directive inputs
  @Input() loaded!: boolean;
  @Input() optionsConfig!: OptionsConfig | undefined;
  @Input() name!: string;
  //#endregion Directive inputs

  //#region Directive outputs
  @Output() optionsChange = new EventEmitter<InputOptionsInterface>();
  @Output() loadingChange = new EventEmitter<boolean>();
  //#endregion Directive outputs

  // Directive properties
  private observer!: IntersectionObserver;

  // Directive constructor
  constructor(
    private elemRef: ElementRef,
    @Inject(INPUT_OPTIONS_CLIENT) private client: InputOptionsClient,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit() {
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

  async query() {
    if (
      this.loaded ||
      typeof this.optionsConfig === 'undefined' ||
      this.optionsConfig === null
    ) {
      return;
    }
    this.loadingChange.emit(true);
    if (
      isCustomURL(this.optionsConfig.source.resource) ||
      isValidHttpUrl(this.optionsConfig.source.resource) ||
      (this.optionsConfig.source.raw.match(/table:/) &&
        this.optionsConfig.source.raw.match(/keyfield:/))
    ) {
      return this.asyncFetch(this.optionsConfig);
    }
    return this.syncFetch(this.optionsConfig);
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

  private syncFetch(optionsConfig: OptionsConfig) {
    const options = mapStringListToInputOptions(optionsConfig.source.raw);
    this.loadingChange.emit(false);
    this.optionsChange.emit(options);
  }

  private async asyncFetch(optionsConfig: OptionsConfig) {
    await lastValueFrom(
      this.client.request({ ...optionsConfig, name: this.name }).pipe(
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
