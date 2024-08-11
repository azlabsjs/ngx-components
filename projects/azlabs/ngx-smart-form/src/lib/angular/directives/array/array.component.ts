import {
  AfterContentInit,
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
import { FormArray, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { BUTTON_DIRECTIVES } from '../buttons';
import { PIPES } from '../../pipes';
import { NgxTableForm } from '../table';
import { NgxFormArrayOutletComponent } from './array-outlet.component';
import { RefType, ViewRefFactory } from '../types';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgxTableForm,
    NgxFormArrayOutletComponent,
    ...BUTTON_DIRECTIVES,
    ...PIPES,
  ],
  selector: 'ngx-smart-form-array',
  templateUrl: './array.component.html',
  styleUrls: ['./array.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayComponent implements AfterContentInit, OnDestroy {
  //#region Component inputs definitions
  @Input({ alias: 'formArray' }) array!: FormArray;
  @Input('no-grid-layout') noGridLayout = false;
  @Input() template!: TemplateRef<any>;
  @Input() addGroupRef!: TemplateRef<Node>;
  @Input() name!: string;
  @Input() autoupload: boolean = true;
  @Input({ alias: 'controls' }) inputs!: InputConfigInterface[];
  @Input({
    alias: 'class',
    transform: (value: string | string[]) => {
      const classes = typeof value === 'string' ? [value] : value;
      return classes
        .map((v) =>
          v
            .split(' ')
            .map((i) => i.split(','))
            .flat()
            .map((v) => v.trim())
        )
        .flat();
    },
  })
  cssClass!: string | string[];
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
    const g = this.builder.group(this.inputs);
    const clone = cloneAbstractControl(g) as FormGroup;
    this.array.push(clone);
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
    console.log(`Ref count: [${value}]`);
    this.cdRef?.markForCheck();
  }
}
