import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
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
export class DropdownComponent
  implements OnDestroy, OnChanges, AfterContentInit
{
  @Input() orientation: Orientation = 'right';
  @Input() animation: Animation = 'scaleY';
  @Input() text!: string;
  @Input({ alias: 'class' }) cssClass!: string;
  @Input({ alias: 'no-hover' }) noHover: boolean = false;
  @Input() disabled: boolean = false;

  // #region component view children
  @ViewChild('dropdownHeader', { static: false })
  headerRef!: ElementRef<HTMLElement>;
  @ViewChild('dropdownMenu', { static: false })
  dropdownMenuRef!: ElementRef<HTMLElement>;
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
  private defaultView!: Window | null;

  /** @description Creates component instances */
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(DOCUMENT) @Optional() document?: Document
  ) {
    const { defaultView } = document ?? ({} as Document);
    this.defaultView = defaultView;
  }
  ngAfterContentInit(): void {
    this.defaultView?.addEventListener(
      'click',
      this.handleClickEvent.bind(this)
    );
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
      this.handleClickEvent.bind(this)
    );
  }

  private handleClickEvent(e: MouseEvent) {
    const { active } = this._state;
    const { dropdownMenuRef } = this;
    if (dropdownMenuRef.nativeElement) {
      const { nativeElement } = dropdownMenuRef;
      const { x, y, width, height } = nativeElement.getBoundingClientRect();
      const { clientX, clientY } = e;
      if (
        clientX >= x &&
        clientX <= x + width &&
        clientY >= y &&
        clientY <= y + height &&
        active
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
  }

  /** @description update component state and notify ui of state changes */
  private setState(state: (s: StateType) => StateType) {
    this._state = state(this._state);
    this.cdRef?.markForCheck();
  }
}
