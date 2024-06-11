import {
  AfterContentInit,
  AfterViewInit,
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
  ViewContainerRef,
} from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { NgxSmartFormArrayChildComponent } from './smart-form-array-child.component';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { SafeValue } from '@angular/platform-browser';
import { AddButtonComponent } from '../add-button';

@Component({
  standalone: true,
  imports: [CommonModule, AddButtonComponent],
  selector: 'ngx-smart-form-array',
  template: `
    <div #container></div>
    <div class="placeholder" *ngIf="refCount === 0">
    </div>
    <ng-container
      *ngTemplateOutlet="
        addGroupRef ? addGroupRef : addTemplate;
        context: { $implicit: onAddButtonClick.bind(this) }
      "
    ></ng-container>

    <ng-template #addTemplate let-handler>
      <ngx-add-button (click)="handler($event)"></ngx-add-button>
    </ng-template>
  `,
  styles: [
    `
      .placeholder {
        border: 0;
        display: flex;
        flex-flow: column nowrap;
        align-items: flex-start;
        justify-content: flex-start;
        padding: var(
            --ngx-array-placeholder-padding-top,
            calc(24 * calc((1rem / 20) * 1))
          )
          0 var(--ngx-array-placeholder-padding-bottom, 4px) 0;
        font-size: var(
          --ngx-array-placeholder-font-size,
          calc(20 * calc((1rem / 24) * 1))
        );
        font-weight: var(--ngx-array-placeholder-font-weight, 400);
        line-height: var(--ngx-array-placeholder-line-height, 1.2rem);
        letter-spacing: var(--ngx-array-placeholder-letter-spacing, -0.01rem);
        color: var(--ngx-array-placeholder-color, inherit);
      }
      .no-control-content {
        display: flex;
        align-items: center;
        align-content: center;
        width: 100%;
        margin: var(--smart-form-array-add-button-margin, 0.5rem) 0;
      }
      .no-control-text {
        display: block;
        margin-top: var(--smart-form-array-add-text-margin-top, 1.05rem);
        margin-left: var(--smart-form-array-add-text-margin-top, 0.5rem);
        font-size: var(--smart-form-array-add-text-font-size, 0.8rem);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormArrayComponent
  implements AfterContentInit, OnDestroy, AfterViewInit
{
  //#region Component inputs definitions
  @Input() header!: string | SafeValue;
  private _array!: FormArray;
  @Input({ alias: 'formArray' }) set setArray(
    value: FormArray<AbstractControl<any>>
  ) {
    this._array = value;
    if (this.inputs) {
      this.appendControls(this._array);
      this._initialized = true;
    }
  }
  @Input('no-grid-layout') noGridLayout = false;
  @Input() template!: TemplateRef<any>;
  @Input() addGroupRef!: TemplateRef<Node>;
  @Input() name!: string;
  private _autoupload: boolean = false;
  @Input({ alias: 'autoupload' }) set setAutoload(value: boolean) {
    this._autoupload = !!value;
    // update child component instance autoupload values
    this.componentRefs?.forEach(
      (ref) => (ref.instance.autoupload = this._autoupload)
    );
  }
  @Input({
    alias: 'controls',
    transform: (value: InputConfigInterface | InputConfigInterface[]) => {
      return Array.isArray(value)
        ? value
        : [value].filter(
            (current) => typeof current !== 'undefined' && current !== null
          );
    },
  })
  inputs!: InputConfigInterface[];
  //#endregion Component inputs definitions

  //#region Component outputs
  @Output() listChange = new EventEmitter<number>();
  @Output() formArrayChange = new EventEmitter<any[]>();
  //#endregion Component outputs

  // #region View children
  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;
  // #endregion View children

  // #region Component properties
  _refCount = 0;
  get refCount() {
    return this._refCount;
  }
  private _destroy$ = new Subject<void>();
  private componentRefs: ComponentRef<NgxSmartFormArrayChildComponent>[] = [];
  /** Helps in calling appendControls in both ngAfterViewInit and `@Input() set setArray()` closure  */
  private _initialized = false;
  // #endregion Component properties

  // Component instance initializer
  constructor(
    private cdRef: ChangeDetectorRef | null,
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngAfterViewInit(): void {
    if (!this._initialized) {
      this.appendControls(this._array);
    }
  }

  ngAfterContentInit(): void {
    this._array.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        tap((state) => this.formArrayChange.emit(state))
      )
      .subscribe();
  }

  onAddButtonClick(event: Event) {
    let count = this._refCount;
    count++;
    this.setRefCount(count);
    const g = this.builder.group(this.inputs);
    const _clone = cloneAbstractControl(g) as FormGroup;
    this.addComponent(_clone, count);
    this._array.push(_clone);
    event.preventDefault();
  }

  addComponent(g: FormGroup, index: number) {
    if (this.inputs) {
      const componentRef = this.viewContainerRef.createComponent(
        NgxSmartFormArrayChildComponent
      );
      // Initialize child component input properties
      componentRef.instance.controls = [...this.inputs];
      componentRef.instance.formGroup = g;
      componentRef.instance.template = this.template;
      componentRef.instance.autoupload = this._autoupload;
      componentRef.instance.index = index;
      componentRef.instance.noGridLayout = this.noGridLayout;
      // Ends child component properties initialization

      componentRef.instance.componentDestroyer
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => {
          let count = this._refCount;
          if (count >= 0) {
            componentRef.destroy();
            count -= 1;
            // Remove the elment from the list of reference components
            const i = this.componentRefs.findIndex((c) => {
              return c.instance.index === componentRef.instance.index;
            });
            if (componentRef.instance.index !== this.componentRefs.length) {
              for (let _i = i + 1; _i < this.componentRefs.length; _i++) {
                const ref = this.componentRefs[_i];
                if (!ref) {
                  break;
                }
                ref.instance.index = ref.instance.index - 1;
              }
            }
            this.componentRefs.splice(i, 1);
            this._array.removeAt(componentRef.instance.index - 1, {
              emitEvent: true,
            });
            this._array.updateValueAndValidity();
            this.setRefCount(count);
            this.listChange.emit(count);
          }
        });
      this.componentRefs.push(componentRef);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  private appendControls(a: FormArray) {
    if (a.getRawValue().length !== 0) {
      // First we cleared the view container reference to remove any existing component
      this.viewContainerRef.clear();
      // Then for each element in the form array we add a new component to the view container reference
      let index = 0;
      for (const control of a.controls) {
        index++;
        this.addComponent(control as FormGroup, index);
      }
      this.setRefCount(index);
    }
  }

  private setRefCount(value: number) {
    this._refCount = value;
    this.cdRef?.markForCheck();
  }
}