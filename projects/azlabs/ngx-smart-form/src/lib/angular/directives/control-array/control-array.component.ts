import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { FormArray } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { NgxSmartFormControlArrayItemComponent } from './control-array-item.component';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { BUTTON_DIRECTIVES } from '../buttons';
import { RefType, ViewRefFactory } from '../types';
import { NgxFormControlArrayOutletComponent } from './control-array-outlet.component';

/** @internal */
type ComponentRefType = ComponentRef<NgxSmartFormControlArrayItemComponent>;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxFormControlArrayOutletComponent,
    ...BUTTON_DIRECTIVES,
  ],
  selector: 'ngx-smart-form-control-array',
  templateUrl: './control-array.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormControlArrayComponent
  implements AfterContentInit, OnDestroy
{
  //#region Component inputs definitions
  @Input({ alias: 'formArray' }) array!: FormArray;
  @Input('no-grid-layout') noGridLayout = false;
  @Input() template!: TemplateRef<any>;
  @Input() addButtonRef!: TemplateRef<any>;
  @Input() name!: string;
  @Input() autoupload: boolean = true;
  @Input() inputConfig!: InputConfigInterface;
  //#endregion Component inputs definitions

  //#region Component outputs
  @Output() listChange = new EventEmitter<number>();
  //#endregion Component outputs

  // #region View children
  @ViewChild('container', { static: false })
  viewFactory!: ViewRefFactory<any>;
  // #endregion View children

  // #region Component properties
  _refCount = 0;
  get refCount() {
    return this._refCount;
  }
  private refs: RefType<unknown>[] = [];
  /** Helps in calling appendControls in both ngAfterViewInit and `@Input() set setArray()` closure  */
  private destroy$ = new Subject<void>();
  // #endregion Component properties

  // Component instance initializer
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngAfterContentInit(): void {
    this.array.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap(() => {
          const length = this.array.controls.length;
          const count = length - this._refCount;
          if (count > 0) {
            for (let index = 0; index < count; index++) {
              const refIndex = this._refCount + index;
              this.refs.push(
                this.viewFactory?.createView(refIndex, this.array.at(refIndex))
              );
            }
            this.setRefCount(this._refCount + count);
          }

          if (count < 0) {
            const refCount = this._refCount > 0 ? this._refCount - 1 : 0;
            this.setRefCount(refCount);
            this.listChange.emit(refCount);
          }
        })
      )
      .subscribe();
  }

  handleAddView(event: Event) {
    const input = this.builder.control(this.inputConfig);
    this.array.push(cloneAbstractControl(input));
    event.preventDefault();
  }

  handleRemoved<T>(ref: RefType<T>) {
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

  private setRefCount(value: number) {
    this._refCount = value;
    this.cdRef?.markForCheck();
  }
}
