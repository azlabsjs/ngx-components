import {
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
import { UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';
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
})
export class NgxSmartFormControlArrayComponent implements OnInit, OnDestroy {
  //#region Component inputs definitions
  @Input() formArray!: UntypedFormArray;
  @Input() inputConfig!: InputConfigInterface;
  @Input() template!: TemplateRef<any>;
  @Input() addButtonRef!: TemplateRef<Node>;
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
  //#endregion Component inputs definitions

  //@internal
  private abstractControl!: UntypedFormControl;
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

  ngOnInit(): void {
    this.abstractControl = this.builder.control(
      this.inputConfig
    ) as UntypedFormControl;
    if (this.formArray.getRawValue().length === 0) {
      this.addNewComponent(this.componentRefCount);
    } else {
      // Add elements
      let index = 0;
      for (const control of this.formArray.controls) {
        this.addComponent(control as UntypedFormControl, index);
        index++;
      }
    }

    // Simulate form array
    this.formArray.valueChanges
      .pipe(tap((state) => this.formArrayChange.emit(state)))
      .subscribe();
  }

  onTemplateButtonClicked(event: Event) {
    this.componentRefCount++;
    this.addNewComponent(this.componentRefCount);
    event.preventDefault();
    event.stopPropagation();
  }

  // tslint:disable-next-line: typedef
  addNewComponent(index: number) {
    const control = cloneAbstractControl(this.abstractControl) as UntypedFormControl;
    this.addComponent(control, index);
    this.formArray.push(control);
  }

  addComponent(control: UntypedFormControl, index: number) {
    const componentRef = this.viewContainerRef.createComponent(
      NgxSmartFormControlArrayChildComponent
    );
    // Initialize child component input properties
    componentRef.instance.inputConfig = { ...this.inputConfig };
    componentRef.instance.control = control;
    componentRef.instance.template = this.template;
    componentRef.instance.autoupload = this._autoupload;
    componentRef.instance.submitupload = this._submitupload;
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
}
