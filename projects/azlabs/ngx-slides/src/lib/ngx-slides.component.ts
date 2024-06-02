import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
  signal,
  inject,
} from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { SLIDES, Slide } from './types';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ngx-slides',
  template: `
    <div class="carousel">
      <ng-container *ngFor="let slide of slides(); let i = index">
        <ng-container *ngIf="i === current()">
          <div class="slide" [@slideIn]="slideLeft() ? 'left' : 'right'">
            <ng-container
              *ngTemplateOutlet="templateRef; context: { $implicit: slide }"
            ></ng-container>
          </div>
        </ng-container>
      </ng-container>

      <ng-container
        *ngTemplateOutlet="
          previousRef ?? prevButton;
          context: { $implicit: previous.bind(this) }
        "
      ></ng-container>
      <ng-container
        *ngTemplateOutlet="
          nextRef ?? nextButton;
          context: { $implicit: next.bind(this) }
        "
      ></ng-container>
      <ng-template #prevButton let-click>
        <button class="control prev" (click)="click()">
          <span class="arrow left"></span>
        </button>
      </ng-template>
      <ng-template #nextButton let-click>
        <button class="control next" (click)="click()">
          <span class="arrow right"></span>
        </button>
      </ng-template>
    </div>
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
  readonly slideLeft = signal(false);
  readonly current = signal(0);
  readonly slides = signal<Slide[]>([]);
  readonly state = signal<{ timer: number; slides: Slide[] }>({
    timer: 0,
    slides: [],
  });
  //#endregion Component properties

  //#region Component inputs
  @Input({ alias: 'timer' }) timer: number = 1000;
  @Input({ alias: 'slides' }) setSlides(values: Slide[]) {
    this.slides.set(values);
  }
  @Input({ alias: 'current' }) setCurrent(value: number) {
    this.current.set(value);
  }
  @Input() autostart = false;
  @ContentChild('ngxSlide') templateRef!: TemplateRef<any>;
  @ContentChild('next') nextRef!: TemplateRef<any>;
  @ContentChild('previous') previousRef!: TemplateRef<any>;
  //#endregion Component inputs

  /** @description Class constructor */
  constructor() {
    inject(SLIDES)?.pipe(
      takeUntil(this._destroy$),
      tap(({ timer, slides }) => {
        this.timer = timer;
        const s = this.slides();
        if (s.length <= 0) {
          this.slides.set(slides);
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
    const [slides, current] = [this.slides(), this.current()];
    const previous = current - 1;
    this.slideLeft.set(true);
    this.current.set(previous < 0 ? slides.length - 1 : previous);
    this.restartLoop();
  }

  next() {
    const [slides, current] = [this.slides(), this.current()];
    const next = current + 1;
    this.slideLeft.set(false);
    this.current.set(next === slides.length ? 0 : next);
    this.restartLoop();
  }

  restartLoop() {
    this._destroy$.next();
    this.runLoop();
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
