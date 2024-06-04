import { CommonModule, DOCUMENT } from '@angular/common';
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
import { Animation, Orientation } from './types';

/** @internal */
type StateType = {
  active: boolean;
  cssClass: Record<string, boolean>;
  menuClass: Record<string, boolean>;
};

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'ngx-azl-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss'],
})
export class DropdownComponent implements OnDestroy, OnChanges, AfterViewInit {
  @Input() orientation: Orientation = 'right';
  @Input() animation: Animation = 'scaleY';
  @Input() text!: string;
  @Input({ alias: 'class' }) cssClass!: string;
  @Input({ alias: 'no-hover' }) noHover: boolean = false;
  @Input() disabled: boolean = false;

  // #region component view children
  @ViewChild('dropdownHeader', { static: false })
  dropdownHeaderRef!: ElementRef<HTMLElement>;
  @ContentChild('dropdownToggle') dropdownToggleRef!: TemplateRef<any>;
  // #endregion component view children

  _state: StateType = {
    active: false,
    cssClass: {} as Record<string, boolean>,
    menuClass: {} as Record<string, boolean>,
  };
  get state() {
    return this._state;
  }
  private defaultView!: Window;

  /** @description Creates component instances */
  constructor(
    private cdRef: ChangeDetectorRef | null,
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

  onToggleDropdown(e: Event) {
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
    e.preventDefault();
    e.stopPropagation();
  }

  ngOnDestroy(): void {
    this.defaultView?.removeEventListener(
      'click',
      this.onDefaultViewClick.bind(this)
    );
  }

  private onDefaultViewClick(e: MouseEvent) {
    const { active } = this._state;
    if (this.dropdownHeaderRef?.nativeElement) {
      const {
        left: x,
        top: y,
        width,
        height,
      } = this.dropdownHeaderRef?.nativeElement.getBoundingClientRect();
      const { clientX, clientY } = e;
      if (
        !(
          clientX >= x &&
          clientX <= x + width &&
          clientY >= y &&
          clientY <= y + height
        ) &&
        active === true
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
    e.preventDefault();
    e.stopPropagation();
  }

  /** @description update component state and notify ui of state changes */
  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
