import {
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import {
  ANGULAR_REACTIVE_FORM_BRIDGE,
  AngularReactiveFormBuilderBridge,
} from '../../types';
import { NgxSmartFormArrayChildComponent } from './ngx-smart-form-array-child.component';

@Component({
  selector: 'ngx-smart-form-array',
  template: `
    <div #container></div>
    <div *ngIf="refCount === 0" class="no-control-content">
      <ng-container
        *ngTemplateOutlet="
          addGroupRef ? addGroupRef : addTemplate;
          context: { $implicit: onTemplateButtonClicked.bind(this) }
        "
      ></ng-container>
      <span class="no-control-text">{{ 'addButtonText' | templateDict }}</span>
    </div>
    <ng-container *ngIf="refCount !== 0">
      <ng-container
        *ngTemplateOutlet="
          addGroupRef ? addGroupRef : addTemplate;
          context: { $implicit: onTemplateButtonClicked.bind(this) }
        "
      ></ng-container>
    </ng-container>

    <ng-template #addTemplate let-handler>
      <ngx-smart-array-add-button
        (click)="handler($event)"
      ></ngx-smart-array-add-button>
    </ng-template>
  `,
  styles: [
    `
      .no-control-content {
        display: flex;
        align-items: center;
        align-content: center;
        width: 100%;
        margin: var(--smart-form-array-add-button-margin, .5rem) 0;
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
export class NgxSmartFormArrayComponent implements OnInit, OnDestroy {
  //#region Component inputs definitions
  @Input() formArray!: FormArray;
  private _controls!: InputConfigInterface[];
  @Input() set controls(value: InputConfigInterface | InputConfigInterface[]) {
    this._controls = Array.isArray(value)
      ? value
      : [value].filter(
          (current) => typeof current !== 'undefined' && current !== null
        );
  }
  get controls() {
    return this._controls;
  }
  @Input() template!: TemplateRef<any>;
  @Input() addGroupRef!: TemplateRef<Node>;
  @Input() name!: string;
  private _autoupload: boolean = false;
  @Input() set autoupload(value: boolean) {
    this._autoupload = !!value;

    // update child component instance autoupload values
    this.componentRefs.forEach(
      (ref) => (ref.instance.autoupload = this._autoupload)
    );
  }
  private _submitupload: boolean = false;
  @Input() set submitupload(value: boolean) {
    this._submitupload = !!value;
    // update child component instance submitupload values
    this.componentRefs.forEach(
      (ref) => (ref.instance.submitupload = this._submitupload)
    );
  }
  private _refCount = 0;
  get refCount() {
    return this._refCount;
  }
  //#endregion Component inputs definitions

  //@internal
  private formGroup!: FormGroup;
  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  private _destroy$ = new Subject<void>();
  private componentRefs: ComponentRef<NgxSmartFormArrayChildComponent>[] = [];

  //#region Component outputs
  @Output() listChange = new EventEmitter<number>();
  @Output() formArrayChange = new EventEmitter<any[]>();
  //#endregion Component outputs

  // Component instance initializer
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngOnInit(): void {
    this.formGroup = this.builder.group(this._controls) as FormGroup;
    if (this.formArray.getRawValue().length !== 0) {
      // Add elements
      let index = 0;
      for (const control of this.formArray.controls) {
        this.addComponent(control as FormGroup, index);
        index++;
      }
    }

    // Simulate form array
    this.formArray.valueChanges
      .pipe(tap((state) => this.formArrayChange.emit(state)))
      .subscribe();
  }

  onTemplateButtonClicked(event: Event) {
    this._refCount++;
    this.addNewComponent(this._refCount);
    event.preventDefault();
    event.stopPropagation();
  }

  // tslint:disable-next-line: typedef
  addNewComponent(index: number) {
    const formGroup = cloneAbstractControl(this.formGroup) as FormGroup;
    this.addComponent(formGroup, index);
    this.formArray.push(formGroup);
  }

  addComponent(formGroup: FormGroup, index: number) {
    const componentRef = this.viewContainerRef.createComponent(
      NgxSmartFormArrayChildComponent
    );
    // Initialize child component input properties
    componentRef.instance.controls = [...this._controls];
    componentRef.instance.formGroup = formGroup;
    componentRef.instance.template = this.template;
    componentRef.instance.autoupload = this._autoupload;
    componentRef.instance.submitupload = this._submitupload;
    componentRef.instance.index = index;
    // Ends child component properties initialization

    componentRef.instance.componentDestroyer
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        if (this._refCount > 0) {
          componentRef.destroy();
          this._refCount -= 1;
          // Remove the elment from the list of reference components
          this.componentRefs = this.componentRefs.filter(
            (component: ComponentRef<NgxSmartFormArrayChildComponent>) => {
              return component.instance === componentRef.instance
                ? false
                : true;
            }
          );
          this.formArray.removeAt(componentRef.instance.index);
          this.listChange.emit(this._refCount);
        } else {
          componentRef.instance.formGroup.reset();
          this.formArray.updateValueAndValidity();
        }
      });
    this.componentRefs.push(componentRef);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }
}
