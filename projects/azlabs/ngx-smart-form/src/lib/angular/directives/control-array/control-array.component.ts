import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { BUTTON_DIRECTIVES } from '../buttons';
import { RefType, ViewRefFactory } from '../types';
import { NgxFormControlArrayOutletComponent } from './control-array-outlet.component';
import { PIPES } from '../../pipes';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxFormControlArrayOutletComponent,
    ...BUTTON_DIRECTIVES,
    ...PIPES,
  ],
  selector: 'ngx-smart-form-control-array',
  templateUrl: './control-array.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormControlArrayComponent
  implements AfterContentInit, OnDestroy, AfterViewInit
{
  //#region Component inputs definitions
  @Input({ alias: 'formArray' }) array!: FormArray;
  @Input('no-grid-layout') noGridLayout = false;
  @Input() template!: TemplateRef<any>;
  @Input() addButtonRef!: TemplateRef<any>;
  @Input() name!: string;
  @Input() autoupload: boolean = true;
  @Input() config!: InputConfigInterface;
  @Input({ required: true }) detached!: AbstractControl[];
  //#endregion Component inputs definitions

  //#region Component outputs
  @Output() listChange = new EventEmitter<number>();
  //#endregion

  // #region View children
  @ViewChild('container', { static: false })
  viewFactory!: ViewRefFactory<any>;
  // #endregion

  // #region component properties
  _refCount = 0;
  get refCount() {
    return this._refCount;
  }
  private refs: RefType<unknown>[] = [];
  private destroy$ = new Subject<void>();
  // #endregion component

  // Component instance initializer
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngAfterViewInit(): void {
    this.update.bind(this).call(null);
  }

  ngAfterContentInit(): void {
    this.array.valueChanges
      .pipe(takeUntil(this.destroy$), tap(this.update.bind(this)))
      .subscribe();
  }

  add(event: Event) {
    const input = this.builder.control(this.config);
    this.array.push(cloneAbstractControl(input));
    event.preventDefault();
  }

  removed<T>(ref: RefType<T>) {
    if (this._refCount >= 0) {
      const index = this.refs.findIndex((c) => {
        return c.index === ref.index;
      });
      if (index === -1) {
        return;
      }
      this.refs.splice(index, 1);
      this.array.removeAt(index, { emitEvent: true });
      this.array.updateValueAndValidity();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private update() {
    const length = this.array.controls.length;
    const count = length - this._refCount;
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const index = this._refCount + i;
        const { viewFactory: factory } = this;
        const view = factory?.createView(index, this.array.at(index));
        this.refs.push(view);
      }
      this.setRefCount(this._refCount + count);
    }

    if (count < 0) {
      const refCount = Math.max(this._refCount - 1, 0);
      this.setRefCount(refCount);
      this.listChange.emit(refCount);
    }
  }

  private setRefCount(value: number) {
    this._refCount = value;
    this.cdRef?.markForCheck();
  }
}
