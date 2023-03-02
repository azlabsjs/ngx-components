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
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.css'],
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
    this._state = typeof state === 'function' ? state(this._state) : { ...this._state, ...state };
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
