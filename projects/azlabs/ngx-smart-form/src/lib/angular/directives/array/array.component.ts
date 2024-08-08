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
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
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
export class NgxSmartFormArrayComponent
  implements AfterContentInit, OnDestroy, AfterViewInit
{
  //#region Component inputs definitions
  private _array!: FormArray;
  @Input({ alias: 'formArray' }) set setArray(
    value: FormArray<AbstractControl<any>>
  ) {
    this._array = value;
    if (this.inputs) {
      this.initializeViews(this._array);
      this.initialized = true;
    }
  }
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
  @Output() formArrayChange = new EventEmitter<any[]>();
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
  private initialized = false;
  private destroy$ = new Subject<void>();
  // #endregion Component properties

  // Component instance initializer
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngAfterViewInit(): void {
    if (!this.initialized) {
      this.initializeViews(this._array);
    }
  }

  ngAfterContentInit(): void {
    this._array.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        tap((state) => this.formArrayChange.emit(state))
      )
      .subscribe();
  }

  handleAddView(event: Event) {
    let count = this._refCount;
    this.setRefCount(count++);
    const g = this.builder.group(this.inputs);
    const clone = cloneAbstractControl(g) as FormGroup;
    this.pushEmbededView(clone, count);
    this._array.push(clone);
    event.preventDefault();
  }

  handleRemoved<T>(ref: RefType<T>) {
    let count = this._refCount;
    if (count >= 0) {
      count -= 1;
      const index = this.refs.findIndex((c) => {
        return c.index === ref.index;
      });
      if (ref.index !== this.refs.length) {
        for (let _i = index + 1; _i < this.refs.length; _i++) {
          const ref = this.refs[_i];
          if (!ref) {
            break;
          }
          ref.index = ref.index - 1;
        }
      }
      this.refs.splice(index, 1);
      this.setRefCount(count);
      this._array.removeAt(ref.index - 1, {
        emitEvent: true,
      });
      this._array.updateValueAndValidity();
      this.listChange.emit(count);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
  }

  private pushEmbededView(g: FormGroup, index: number) {
    if (!this.inputs) {
      return;
    }
    this.refs.push(this.viewFactory?.createView(index, g));
  }

  private initializeViews(array: FormArray) {
    if (array.getRawValue().length !== 0) {
      this.viewFactory?.clear();
      let i = 0;
      for (const control of array.controls) {
        i++;
        this.pushEmbededView(control as FormGroup, i);
      }
      this.setRefCount(i);
    }
  }

  private setRefCount(value: number) {
    this._refCount = value;
    this.cdRef?.markForCheck();
  }
}
