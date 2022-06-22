import {
  AfterViewInit,
  Directive,
  EventEmitter,
  Host,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ClrDatagrid } from '@clr/angular';
import { Subject, takeUntil, tap } from 'rxjs';
import { GriSelectDirectiveInputType } from '../core/types';

@Directive({ selector: '[clrGridSelect]' })
export class NgxClrGridSelectDirective
  implements AfterViewInit, OnInit, OnDestroy
{
  // Input properties
  @Input() selectionConfig!: GriSelectDirectiveInputType;
  @Input() selectState: unknown | unknown[];

  // Output Properties
  @Output() selectStateChange = new EventEmitter<unknown | unknown[]>();

  private _destroy = new Subject<void>();

  // Instance initializer
  constructor(@Host() private host: ClrDatagrid) {}

  // Directive init state listener
  ngOnInit(): void {
    // Listen for selected State changes
    this.host.selectedChanged
      .pipe(
        takeUntil(this._destroy),
        tap((state) => this.selectStateChange.emit(state))
      )
      .subscribe();

    // Listen for single selected state changes
    this.host.singleSelectedChanged
      .pipe(
        takeUntil(this._destroy),
        tap((state) => this.selectStateChange.emit(state))
      )
      .subscribe();
  }

  ngAfterViewInit() {
    if (
      typeof this.host === 'undefined' ||
      this.host === null ||
      !this.selectionConfig.selectable
    ) {
      return;
    }
    // Set [selected] or [singleSelection] of the host component
    if (this.selectionConfig.singleSelection) {
      this.host.singleSelected = this.selectState;
    } else {
      this.host.selected = this.selectState = [];
    }
  }

  // Directive destructor listener
  ngOnDestroy(): void {
    this._destroy.next();
  }
}
