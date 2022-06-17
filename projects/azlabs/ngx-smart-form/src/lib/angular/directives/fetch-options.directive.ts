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
import { OptionsInputItemsInterface, SelectOptionsClient } from '../../core';
import { createIntersectionObserver } from '../helpers';
import { OPTIONS_INPUT_ITEMS_CLIENT } from '../types';

// TODO : Add an alternative if the intersection observer is not supported

@Directive({
  selector: '[prefetchOptions]',
})
export class FetchOptionsDirective implements AfterViewInit, OnDestroy {
  //#region Directive inputs
  @Input() loaded!: boolean;
  @Input() params!: string | any[] | undefined;
  //#endregion Directive inputs

  //#region Directive outputs
  @Output() loadedChange = new EventEmitter<boolean>();
  @Output() itemsChange = new EventEmitter<OptionsInputItemsInterface>();
  @Output() loadingChange = new EventEmitter<boolean>();
  //#endregion Directive outputs

  // Directive properties
  private observer!: IntersectionObserver;

  // Directive constructor
  constructor(
    private elemRef: ElementRef,
    @Inject(OPTIONS_INPUT_ITEMS_CLIENT) private client: SelectOptionsClient
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

  executeQuery() {
    if (!this.loaded && this.params) {
      this.loadingChange.emit(true);
      // Query select options
      this.client
        .request(this.params)
        .pipe(
          first(),
          tap((state) => {
            this.loadingChange.emit(false);
            this.itemsChange.emit(state);
          })
        )
        .subscribe();
    }
  }

  ngOnDestroy(): void {
    // Disconnect from the observer
    this.observer.disconnect();
  }
}
