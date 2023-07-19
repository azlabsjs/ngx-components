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
} from '@angular/core';
import { AbstractControl, FormArray } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { cloneAbstractControl } from '../../helpers';
import {
  AngularReactiveFormBuilderBridge,
  ANGULAR_REACTIVE_FORM_BRIDGE,
} from '../../types';
import { NgxSmartFormControlArrayChildComponent } from './ngx-smart-form-control-array-child.component';

@Component({
  selector: 'ngx-smart-form-control-array',
  template: `
    <div #container></div>
    <ng-container
      *ngTemplateOutlet="
        addButtonRef ? addButtonRef : addTemplate;
        context: { $implicit: onTemplateButtonClicked.bind(this) }
      "
    ></ng-container>

    <ng-template #addTemplate let-handler>
      <ngx-smart-array-add-button
        (click)="handler($event)"
      ></ngx-smart-array-add-button>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormControlArrayComponent
  implements AfterContentInit, OnDestroy
{
  //#region Component inputs definitions
  @Input() formArray!: FormArray<AbstractControl>;
  @Input() inputConfig!: InputConfigInterface;
  @Input() template!: TemplateRef<any>;
  @Input() addButtonRef!: TemplateRef<any>;
  @Input() name!: string;
  private _autoupload: boolean = false;
  @Input() set autoupload(value: boolean) {
    this._autoupload = !!value;

    // update child component instance autoupload values
    this.componentRefs.forEach(
      (ref) => (ref.instance.autoupload = this._autoupload)
    );
  }
  //#endregion Component inputs definitions

  @ViewChild('container', { read: ViewContainerRef, static: true })
  viewContainerRef!: ViewContainerRef;

  private _destroy$ = new Subject<void>();
  private componentRefCount = 0;
  private componentRefs: ComponentRef<NgxSmartFormControlArrayChildComponent>[] =
    [];

  //#region Component outputs
  @Output() listChange = new EventEmitter<number>();
  @Output() formArrayChange = new EventEmitter<any[]>();
  //#endregion Component outputs

  // Component instance initializer
  constructor(
    @Inject(ANGULAR_REACTIVE_FORM_BRIDGE)
    private builder: AngularReactiveFormBuilderBridge
  ) {}

  ngAfterContentInit(): void {
    if (this.formArray.getRawValue().length === 0) {
      return this.addNewComponent(this.componentRefCount);
    }
    // Add elements
    this.addArrayControls();

    // Simulate form array
    this.formArray.valueChanges
      .pipe(tap((state) => this.formArrayChange.emit(state)))
      .subscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    if ('formArray' in changes) {
      this.addArrayControls();
    }
  }

  onTemplateButtonClicked(event: Event) {
    this.componentRefCount++;
    this.addNewComponent(this.componentRefCount);
    event.preventDefault();
    event.stopPropagation();
  }

  // tslint:disable-next-line: typedef
  addNewComponent(index: number) {
    const control = cloneAbstractControl(
      this.builder.control(this.inputConfig)
    ) as AbstractControl;
    this.addComponent(control, index);
    this.formArray.push(control);
  }

  addComponent(control: AbstractControl, index: number) {
    const componentRef = this.viewContainerRef.createComponent(
      NgxSmartFormControlArrayChildComponent
    );
    // Initialize child component input properties
    componentRef.instance.inputConfig = { ...this.inputConfig };
    componentRef.instance.control = control;
    componentRef.instance.template = this.template;
    componentRef.instance.autoupload = this._autoupload;
    componentRef.instance.index = index;
    // Ends child component properties initialization

    componentRef.instance.componentDestroyer
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => {
        if (this.componentRefCount > 0) {
          componentRef.destroy();
          this.componentRefCount -= 1;
          // Remove the elment from the list of reference components
          this.componentRefs = this.componentRefs.filter(
            (
              component: ComponentRef<NgxSmartFormControlArrayChildComponent>
            ) => {
              return component.instance === componentRef.instance
                ? false
                : true;
            }
          );
          this.formArray.removeAt(componentRef.instance.index);
          this.listChange.emit(this.componentRefCount);
        } else {
          componentRef.instance.control.reset();
          this.formArray.updateValueAndValidity();
        }
      });
    this.componentRefs.push(componentRef);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  private addArrayControls() {
    if (this.formArray.getRawValue().length !== 0) {
      this.viewContainerRef.clear();
      let index = 0;
      for (const control of this.formArray.controls) {
        this.addComponent(control as AbstractControl, index);
        index++;
      }
    }
  }
}
