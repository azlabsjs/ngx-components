import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { computeCssClass, computeMenuClass } from './helpers';
import { Animation, Orientation, SetStateParam } from './types';

type StateType = {
  active: boolean;
  cssClass: Record<string, boolean>;
  menuClass: Record<string, boolean>;
};

@Component({
  selector: 'ngx-azl-dropdown',
  template: `
    <div class="dropdown-container">
      <div class="ngx-azl-dropdown" [ngClass]="state.cssClass">
        <a
          href="#"
          id="dropdown-toggle"
          (click)="onToggleDropdown($event)"
          class="ngx-azl-dropdown-header"
          #dropdownHeader
        >
          <ng-container
            *ngTemplateOutlet="dropdownToggleRef ?? defaultDdHeader"
          ></ng-container>
        </a>
        <div class="ngx-azl-dropdown-menu" [ngClass]="state.menuClass">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
    <ng-template #defaultDdHeader>
      <div class="ngx-azl-dropdown-header">
        <span class="ngx-azl-dropdown-text">
          {{ text }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="icon chevron-down"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              class="path"
              d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
            /></svg
        ></span>
      </div>
    </ng-template>
  `,
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnDestroy, OnChanges, AfterViewInit {
  /**
   * @attr orientation
   */
  @Input() orientation: Orientation = 'right';

  /**
   * @attr animation
   */
  @Input() animation: Animation = 'scaleY';

  /**
   * @attr text
   */
  @Input() text!: string;

  /**
   * @attr class
   */
  @Input('class') cssClass!: string;

  /**
   * @attr no-hover
   */
  @Input('no-hover') noHover: boolean = false;

  /**
   * @attr disabled
   */
  @Input() disabled: boolean = false;

  // #region component view children
  @ViewChild('dropdownHeader', { static: false })
  dropdownHeaderRef!: ElementRef<HTMLElement>;
  @ContentChild('dropdownToggle') dropdownToggleRef!: TemplateRef<any>;
  // #endregion component view children

  private _state: StateType = {
    active: false,
    cssClass: {} as Record<string, boolean>,
    menuClass: {} as Record<string, boolean>,
  };

  get state() {
    return this._state;
  }

  private defaultView!: Window;

  /**
   * Creates component instances
   *
   */
  constructor(
    private changeRef: ChangeDetectorRef,
    @Inject(DOCUMENT) @Optional() document?: Document
  ) {
    const { defaultView } = document ?? ({} as Document);
    if (defaultView) {
      this.defaultView = defaultView;
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (
      'orientation' in changes ||
      'animation' in changes ||
      'noHover' in changes ||
      'active' in changes ||
      'disabled' in changes
    ) {
      this.setState((state) => ({
        ...state,
        menuClass: computeMenuClass(this.orientation, this.animation),
        cssClass: computeCssClass(
          this.cssClass,
          this.noHover,
          state.active,
          this.disabled
        ),
      }));
    }
  }

  ngAfterViewInit(): void {
    this.defaultView?.addEventListener(
      'click',
      this.onDefaultViewClick.bind(this)
    );
  }

  onToggleDropdown(event: Event) {
    if (this.noHover && !this.disabled) {
      this.setState((state) => ({
        ...state,
        active: !state.active,
        menuClass: computeMenuClass(this.orientation, this.animation),
        cssClass: computeCssClass(
          this.cssClass,
          this.noHover,
          !state.active,
          this.disabled
        ),
      }));
    }
    event.preventDefault();
    event.stopPropagation();
  }

  ngOnDestroy(): void {
    this.defaultView?.removeEventListener(
      'click',
      this.onDefaultViewClick.bind(this)
    );
  }

  private setState(state: SetStateParam<StateType>) {
    if (typeof state === 'function') {
      this._state = state(this._state);
    }
    this._state = { ...this._state, ...state };
    this.changeRef.markForCheck();
  }

  private onDefaultViewClick(event: MouseEvent) {
    if (this.dropdownHeaderRef?.nativeElement) {
      const {
        left: x,
        top: y,
        width,
        height,
      } = this.dropdownHeaderRef?.nativeElement.getBoundingClientRect();
      if (
        !(
          event.clientX >= x &&
          event.clientX <= x + width &&
          event.clientY >= y &&
          event.clientY <= y + height
        ) &&
        this._state.active === true
      ) {
        this.setState((state) => ({
          ...state,
          active: !state.active,
          menuClass: computeMenuClass(this.orientation, this.animation),
          cssClass: computeCssClass(
            this.cssClass,
            this.noHover,
            !state.active,
            this.disabled
          ),
        }));
      }
    }
    event.stopPropagation();
  }
}
