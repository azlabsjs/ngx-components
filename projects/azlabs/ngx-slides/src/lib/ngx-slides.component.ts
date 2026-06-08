import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { Optional, SLIDES, Slide, StateType } from './types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ngx-slides',
  template: `
    @if (state) {
      <div class="carousel">
        @for (slide of state.slides; track slide; let i = $index) {
          @if (i === state.current) {
            <div class="slide" [@slideIn]="state.direction">
              <ng-container *ngTemplateOutlet="templateRef; context: { $implicit: slide }"></ng-container>
            </div>
          }
        }
        <ng-container *ngTemplateOutlet="prevButton ?? _prev; context: { $implicit: previous.bind(this) }"></ng-container>
        <ng-container *ngTemplateOutlet="nextButton ?? _next; context: { $implicit: next.bind(this) }"></ng-container>
        <ng-template #_prev let-click>
          <button class="control prev" (click)="click()">
            <span class="arrow left"></span>
          </button>
        </ng-template>
        <ng-template #_next let-click>
          <button class="control next" (click)="click()">
            <span class="arrow right"></span>
          </button>
        </ng-template>
      </div>
    }
    `,
  styleUrls: ['./ngx-slides.component.scss'],
  animations: [
    trigger('slideIn', [
      transition('void => right', [
        style({ transform: 'translateX(-100%)', opacity: 1 }),
        animate(
          '400ms ease-in',
          style({ transform: 'translateX(0%)', opacity: 1 })
        ),
      ]),
      transition('right => void', [
        style({ transform: 'translateX(0%)', opacity: 1 }),
        animate(
          '400ms ease-out',
          style({ transform: 'translateX(0%)', opacity: 0 })
        ),
      ]),
      transition('void => left', [
        style({ transform: 'translateX(100%)', opacity: 1 }),
        animate(
          '400ms ease-in',
          style({ transform: 'translateX(0%)', opacity: 1 })
        ),
      ]),
      transition('left => void', [
        style({ transform: 'translateX(0%)', opacity: 1 }),
        animate(
          '400ms ease-out',
          style({ transform: 'translateX(0%)', opacity: 0 })
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSlidesComponent implements OnInit, OnDestroy {
  //#region Component properties
  private _destroy$ = new Subject<void>();
  _state: StateType = { timer: 0, slides: [], current: 0, direction: 'right' };
  get state() {
    return this._state;
  }
  //#endregion

  //#region Component inputs
  @Input({ alias: 'timer' }) timer: number = 1000;
  @Input({ alias: 'slides' }) setSlides(values: Slide[]) {
    this.setState((state) => ({ ...state, slides: values }));
  }
  @Input({ alias: 'current' }) setCurrent(value: number) {
    this.setState((state) => ({ ...state, current: value }));
  }
  @Input() autostart = false;
  @ContentChild('ngxSlide') templateRef!: Optional<TemplateRef<any>>;
  @ContentChild('next') nextButton: Optional<TemplateRef<any>>;
  @ContentChild('previous') prevButton: Optional<TemplateRef<any>>;
  //#endregion

  /** @description slides component class constructor */
  constructor(private cdRef: ChangeDetectorRef) {
    inject(SLIDES)?.pipe(
      takeUntil(this._destroy$),
      tap(({ timer, slides: _slides }) => {
        const { slides } = this._state;
        if (slides.length <= 0) {
          this.timer = timer;
          this.setState((state) => ({ ...state, slides: _slides }));
        }
      })
    );
  }

  async ngOnInit() {
    if (this.autostart) {
      this.runLoop();
    }
  }

  runLoop() {
    interval(this.timer)
      .pipe(
        takeUntil(this._destroy$),
        tap((_) => this.next())
      )
      .subscribe();
  }

  previous() {
    const { slides, current } = this._state;
    const previous = current - 1;
    this.setState((state) => ({ ...state, direction: 'left', current: previous < 0 ? slides.length - 1 : previous }));
    this.restartLoop();
  }

  next() {
    const { slides, current } = this._state;
    const next = current + 1;
    this.setState((state) => ({ ...state, direction: 'right', current: next === slides.length ? 0 : next }));
    this.restartLoop();
  }

  restartLoop() {
    this._destroy$.next();
    this.runLoop();
  }

  ngOnDestroy() {
    this._destroy$.next();
  }

  /** @description change component local state and request ui update */
  setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
