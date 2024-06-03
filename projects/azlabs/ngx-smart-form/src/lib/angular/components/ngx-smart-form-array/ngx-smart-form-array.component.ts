import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  signal,
} from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import { AngularReactiveFormBuilderBridge } from '../../types';
import { NgxSmartFormArrayChildComponent } from './ngx-smart-form-array-child.component';
import { ANGULAR_REACTIVE_FORM_BRIDGE } from '../../tokens';
import { CommonModule } from '@angular/common';
import { AddButtonComponent } from '../partials';

@Component({
  standalone: true,
  imports: [CommonModule, AddButtonComponent],
  selector: 'ngx-smart-form-array',
  template: `
    <div #container></div>
    <div *ngIf="refCount() === 0" class="no-control-content">
      <ng-container
        *ngTemplateOutlet="
          addGroupRef ? addGroupRef : addTemplate;
          context: { $implicit: onComponentDestroy.bind(this) }
        "
      ></ng-container>
    </div>
    <ng-container *ngIf="refCount() !== 0">
      <ng-container
        *ngTemplateOutlet="
          addGroupRef ? addGroupRef : addTemplate;
          context: { $implicit: onComponentDestroy.bind(this) }
        "
      ></ng-container>
    </ng-container>

    <ng-template #addTemplate let-handler>
      <ngx-add-button (click)="handler($event)"></ngx-add-button>
    </ng-template>
  `,
  styles: [
    `
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
export class NgxSmartFormArrayComponent implements AfterContentInit, OnDestroy {
  //#region Component inputs definitions
  @Input() formArray!: FormArray<AbstractControl<any>>;
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
  controls!: InputConfigInterface[];
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
  private _destroy$ = new Subject<void>();
  private componentRefs: ComponentRef<NgxSmartFormArrayChildComponent>[] = [];
  refCount = signal(0);
  // #endregion Component properties

  // Component instance initializer
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if ('formArray' in changes) {
      this.addArrayControls();
    }
  }

  ngAfterContentInit(): void {
    this.addArrayControls();
    // Simulate form array
    this.formArray.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        tap((state) => this.formArrayChange.emit(state))
      )
      .subscribe();
  }

  onComponentDestroy(event: Event) {
    this.refCount.update((v) => v++);
    const refCount = this.refCount();
    this._addComponent(refCount);
    event.preventDefault();
    event.stopPropagation();
  }

  // tslint:disable-next-line: typedef
  private _addComponent(index: number) {
    const formGroup = cloneAbstractControl(
      this.builder.group(this.controls)
    ) as FormGroup;
    this.addComponent(formGroup, index);
    this.formArray.push(formGroup);
  }

  addComponent(formGroup: FormGroup, index: number) {
    if (this.controls) {
      const componentRef = this.viewContainerRef.createComponent(
        NgxSmartFormArrayChildComponent
      );
      // Initialize child component input properties
      componentRef.instance.controls = [...this.controls];
      componentRef.instance.formGroup = formGroup;
      componentRef.instance.template = this.template;
      componentRef.instance.autoupload = this._autoupload;
      componentRef.instance.index = index;
      componentRef.instance.noGridLayout = this.noGridLayout;
      // Ends child component properties initialization

      componentRef.instance.componentDestroyer
        .pipe(takeUntil(this._destroy$))
        .subscribe(() => {
          let refCount = this.refCount();
          if (refCount > 0) {
            componentRef.destroy();
            refCount -= 1;
            // Remove the elment from the list of reference components
            this.componentRefs = this.componentRefs.filter(
              (component: ComponentRef<NgxSmartFormArrayChildComponent>) => {
                return component.instance === componentRef.instance
                  ? false
                  : true;
              }
            );
            this.formArray.removeAt(componentRef.instance.index);
            this.refCount.set(refCount);
            this.listChange.emit(refCount);
          } else {
            componentRef.instance.formGroup.reset();
            this.formArray.updateValueAndValidity();
          }
        });
      this.componentRefs.push(componentRef);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  private addArrayControls() {
    if (this.formArray.getRawValue().length !== 0) {
      // First we cleared the view container reference to remove any existing component
      this.viewContainerRef.clear();
      // Then for each element in the form array we add a new component to the view container
      // reference
      let index = 0;
      for (const control of this.formArray.controls) {
        this.addComponent(control as FormGroup, index);
        index++;
      }
    }
  }
}
