import {
  animate,
  keyframes,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChange,
  SimpleChanges,
  TemplateRef,
} from '@angular/core';
import { OutletConfig, SizeType } from './types';
import { PIPES } from './pipes';
import { COMMON_PIPES } from '@azlabsjs/ngx-common';
import { CdkDragPlaceholder } from "@angular/cdk/drag-drop";

/** @internal */
type StateType = {
  opened: boolean;
  size: SizeType;
};

@Component({
  imports: [CommonModule, ...PIPES, COMMON_PIPES, CdkDragPlaceholder],
  selector: 'ngx-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
  animations: [
    trigger('fadeInOutSlideBottom', [
      transition('close => open', [
        style({ transform: 'translateY(-1000)', opacity: 1 }),
        animate(
          '0.45s cubic-bezier(0.165, 0.84, 0.44, 1)',
          style({ transform: 'translateY(0)', opacity: 1 })
        ),
      ]),
      transition('open => close', [
        style({ transform: 'translateY(0)', opacity: 1 }),
        animate(
          '0.45s cubic-bezier(0.165, 0.84, 0.44, 1)',
          style({ transform: 'translateY(-1000)', opacity: 0 })
        ),
      ]),
    ]),
    trigger('scaleUpDown', [
      transition('close => open', [
        style({ transform: 'scale(0)' }),
        animate(
          '0.45s cubic-bezier(0.165, 0.84, 0.44, 1)',
          keyframes([
            style({ transform: 'scale(0)', offset: 0 }),
            style({ transform: 'scale(1)', offset: 1 }),
          ])
        ),
      ]),
      transition('open => close', [
        style({ transform: 'scale(1)' }),
        animate(
          '0.45s cubic-bezier(0.165, 0.84, 0.44, 1)',
          keyframes([
            style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
            style({ transform: 'scale(0)', opacity: 0, offset: 1 }),
          ])
        ),
      ]),
    ]),
    trigger('scaleUpDownContent', [
      transition('close => open', [
        style({ transform: 'scale(1)', opacity: 1 }),
        animate(
          '0.45s cubic-bezier(0.165, 0.84, 0.44, 1)',
          keyframes([
            style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
            style({ transform: 'scale(2)', opacity: 0, offset: 0.99 }),
            style({ transform: 'scale(0)', offset: 1 }),
          ])
        ),
      ]),
      transition('open => close', [
        style({ transform: 'scale(2)', opacity: 0 }),
        animate(
          '0.45s cubic-bezier(0.165, 0.84, 0.44, 1)',
          keyframes([
            style({ transform: 'scale(2)', opacity: 0, offset: 0 }),
            style({ transform: 'scale(1)', opacity: 1, offset: 1 }),
          ])
        ),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent implements OnChanges {
  // #region component internal properties
  private _state: StateType = {
    opened: false,
    size: 'lg',
  };
  get state() {
    return this._state;
  }
  // #region

  // #region component inputs
  @Input() opened: boolean = false;
  private _size!: SizeType;
  @Input() set size(value: SizeType) {
    this._size = value;
  }
  get size() {
    return this._size ?? 'lg';
  }
  @Input() closeable: boolean = false;
  @Input() animation: 'fade' | 'scale' = 'fade';
  @Input() outlet!: OutletConfig | null | undefined;
  @Input() cssClass!: string | string[];
  @Input() actions!: TemplateRef<any>;
  // #endregion

  // #region component output
  @Output() openedChange = new EventEmitter<boolean>();
  // #region

  // #region content children
  @ContentChild('template') templateRef!: TemplateRef<unknown>;
  // #endregion

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKeyPress(event: KeyboardEvent) {
    if (this._state.opened) {
      this.close();
      event?.stopPropagation();
    }
  }

  // class constructor
  constructor(private _ref?: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    const state = (Object.keys(this._state) as (keyof StateType)[]).reduce(
      (carry, curr: keyof StateType) => {
        if (curr in changes) {
          carry[curr] = changes[curr].currentValue;
        }
        return carry;
      },
      {} as Partial<StateType>
    );

    // update the state on changes
    this.setState(state);
  }

  /** control or change component local state object */
  private setState(
    _partial: Partial<StateType> | ((_state: StateType) => StateType)
  ) {
    if (typeof _partial === 'function' && _partial !== null) {
      this._state = _partial({ ...this.state });
    } else {
      this._state = { ...this.state, ..._partial };
    }
    this._ref?.markForCheck();
  }

  close() {
    this.onClose();
  }

  open() {
    this.setState({ opened: true });
  }

  onClose(event?: Event) {
    this.setState({ opened: false });
    this.openedChange.emit(false);
    event?.stopPropagation();
  }

  setProperty(name: keyof typeof this, value: any) {
    this.setProperties({ [name]: value } as Record<keyof typeof this, any>);
  }

  setProperties(items: Partial<Record<keyof typeof this, any>>) {
    const changes: SimpleChanges = {};
    for (const property of Object.keys(items)) {
      const prop = property as keyof typeof this;
      const old = this[prop];
      this[prop] = items[prop];
      changes[prop as string] = new SimpleChange(old, items[prop], false);
    }
    this.ngOnChanges(changes);
  }

  resize(size: SizeType) {
    this.setState({ size });
  }
}
