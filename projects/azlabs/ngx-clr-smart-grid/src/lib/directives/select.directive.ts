import { Directive, EventEmitter, Host, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ClrDatagrid } from '@clr/angular';
import { Subject, takeUntil, tap } from 'rxjs';
import { GriSelectDirectiveInputType } from '../core/types';

/** @deprecated */
@Directive({ selector: '[clrGridSelect]', standalone: true })
export class NgxClrGridSelectDirective implements OnInit, OnDestroy {
  @Input() selectionConfig!: GriSelectDirectiveInputType;

  @Output() selectStateChange = new EventEmitter<unknown | unknown[]>();

  private _destroy = new Subject<void>();

  constructor(@Host() private host: ClrDatagrid) { }

  ngOnInit(): void {
    if (this.host) {
      this.host.selectedChanged
        .pipe(
          takeUntil(this._destroy),
          tap((state) => this.selectStateChange.emit(state))
        )
        .subscribe();
    }
  }


  ngOnDestroy(): void {
    this._destroy.next();
  }
}
