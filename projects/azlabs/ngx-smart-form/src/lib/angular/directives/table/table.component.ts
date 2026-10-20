import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EmbeddedViewRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  Injector,
  Optional as ngOptional,
} from '@angular/core';
import { RefType, ViewRefFactory } from '../types';
import { AbstractControl, FormGroup } from '@angular/forms';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { Subject, Subscription } from 'rxjs';
import { BUTTON_DIRECTIVES } from '../buttons';
import { COMMON_PIPES } from '@azlabsjs/ngx-common';
import { ModalDirective } from '../modal';
import { PIPES } from './pipes';
import { withRefetchObservable } from '../../helpers';
import { ContextType, Optional } from './types';



@Component({
  standalone: true,
  imports: [CommonModule, ...COMMON_PIPES, ...BUTTON_DIRECTIVES, ...PIPES],
  selector: 'ngx-table-form',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxTableForm implements ViewRefFactory<EmbeddedViewRef<any>>, OnDestroy {
  _view!: Optional<TemplateRef<any>>;
  @Input({ alias: 'template' }) set view(value: Optional<TemplateRef<any>>) {
    this._view = value;
    if (this.modal && value) {
      this.modal.setView(value);
    }
  }
  get view() {
    return this._view;
  }

  _label!: Optional<TemplateRef<any>>;
  @Input() set label(value: Optional<TemplateRef<any>>) {
    this._label = value;
    if (this.modal && value) {
      this.modal.setLabel(value);
    }
  }
  get label() {
    return this._label;
  }

  _inputs: InputConfigInterface[] = [];
  @Input() set inputs(value: InputConfigInterface[]) {
    this._inputs = value;
    if (this.modal && value) {
      this.modal.setInputs(value);
    }
  }
  get inputs() {
    return this._inputs;
  }

  _autoupload: boolean = true;
  @Input({ alias: 'auto-upload' }) set autoupload(value: boolean) {
    this._autoupload = value;
    if (this.modal) {
      this.modal.setAutoUpload(value);
    }
  }
  get autoupload() {
    return this._autoupload;
  }

  _detached: Optional<AbstractControl[]> = [];
  @Input() set detached(value: Optional<AbstractControl[]>) {
    this._detached = value;
    if (this.modal) {
      this.modal.setDetached(value);
    }
  }
  get detached() {
    return this._detached;
  }

  _title!: string;
  @Input() set title(value: string) {
    this._title = value;
    if (this.modal) {
      this.modal.setTitle(value);
    }
  }
  get title() {
    return this._title;
  }


  _name!: string;
  @Input() set name(value: string) {
    this._name = value;
    if (this.modal) {
      this.modal.setName(value);
    }
  }
  get name() {
    return this._name;
  }


  @Input() modal!: ModalDirective;
  @Input({ alias: 'edit-mode' }) editmode: 'modal' | 'inline' | 'both' | 'none' = 'both'; // edit-mode-modal

  @Output() removed = new EventEmitter<RefType<EmbeddedViewRef<any>>>();

  @ViewChild('container', { read: ViewContainerRef, static: false }) _container!: ViewContainerRef;
  @ViewChild('template', { static: false }) _template!: TemplateRef<any>;

  private subscriptions: Subscription[] = [];

  constructor(private injector: Injector, @ngOptional() private cdref: ChangeDetectorRef | null) { }

  createView(index: number, formgroup: AbstractControl, triggered: boolean = false) {
    const subject = new Subject<number>();
    const inputs = withRefetchObservable([...this._inputs], formgroup as FormGroup, this.name);

    // case a modal component is provided we open the modal and pass required input configuration to it
    if (triggered && this.modal) {
      this.showModalView(inputs, formgroup);
    }

    const element = this._container?.createEmbeddedView<ContextType>(this._template, {
      formgroup,
      autoupload: this.autoupload,
      inputs,
      remove: (e: Event) => {
        e?.preventDefault();
        if (!ref) return;
        ref.destroy();
        subject.next(ref.index);
      },
      destroy: subject.asObservable(),
    }, { index, injector: this.injector });

    const ref: RefType<EmbeddedViewRef<any>> = { index, element, destroy: () => element.destroy() };

    const subscription = element.context.destroy.subscribe(() => this.removed.emit(ref));

    this.subscriptions.push(subscription);

    return ref;
  }


  updateView(ref: RefType<EmbeddedViewRef<any>>, formgroup: AbstractControl) {
    ref.element.context.formgroup = formgroup;
    this.cdref?.markForCheck();
  }

  clear(): void {
    this._container?.clear();
  }

  showModalView(inputs: InputConfigInterface[], formgroup: AbstractControl) {

    if (formgroup.disabled) {
      formgroup.enable();
    }

    if (this.modal) {
      this.modal.formgroup = formgroup as FormGroup;
      this.modal.inputs = inputs;
      this.modal.autoupload = this._autoupload;
      this.modal.title = this._title;
      this.modal.detached = this._detached;
      this.modal.name = this._name;

      if (this._view) {
        this.modal.view = this._view;
      }

      if (this._label) {
        this.modal.label = this._label;
      }

      this.modal.open();

      const subscription = this.modal.closed.subscribe(() => {
        if (this.editmode === 'modal' || this.editmode === 'none' && formgroup.enabled) {
          formgroup.disable();
        }
      });

      this.subscriptions.push(subscription);
    }
  }

  ngOnDestroy(): void {
    for (const subscription of this.subscriptions) {
      subscription?.unsubscribe();
    }
  }
}
