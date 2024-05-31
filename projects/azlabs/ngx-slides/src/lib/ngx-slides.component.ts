import { animate, style, transition, trigger } from '@angular/animations';
import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  ContentChild,
  TemplateRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { createSlide } from './helpers';
import { SlideContentLoader } from './slide-content-loader.service';
import { Slide } from './models/slide';

@Component({
  selector: 'ngx-slides',
  template: `
    <div class="carousel">
      <ng-container *ngFor="let slide of slides; let i = index">
        <ng-container *ngIf="i === current">
          <div class="slide" [@slideIn]="slideLeft ? 'left' : 'right'">
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
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NgxSlidesComponent implements OnInit, OnDestroy {
  //# Component Properties
  private _destroy$ = new Subject<void>();

  //#region Component inputs
  @Input() timer = 1000;
  @Input() slides: Slide[] = [];
  @Input() current: number = 0;
  @Input() autostart: boolean = false;
  @ContentChild('ngxSlide') templateRef!: TemplateRef<any>;
  @ContentChild('next') nextRef!: TemplateRef<any>;
  @ContentChild('previous') previousRef!: TemplateRef<any>;
  //#endregion Component inputs
  slideLeft: boolean = false;

  constructor(private contentLoader: SlideContentLoader) {}

  async ngOnInit() {
    // Load the slides only if not set by the parent component
    if (this.slides.length === 0) {
      const contents = this.contentLoader!.contents;
      if (contents) {
        this.timer = contents.timer;
        this.slides = contents.slides.map((value, index: number) =>
          createSlide(
            index,
            typeof value.data === 'string' ? value.data : value.data!.toString()
          )
        );
      }
    }
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
    const previous = this.current - 1;
    this.slideLeft = true;
    this.current = previous < 0 ? this.slides.length - 1 : previous;
    this.restartLoop();
  }

  next() {
    const next = this.current + 1;
    this.slideLeft = false;
    this.current = next === this.slides.length ? 0 : next;
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
