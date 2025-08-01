import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  TemplateRef,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputConfigInterface, InputTypes } from '@azlabsjs/smart-form-core';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { InputEventArgs } from './types';
import { FILE_INPUT_DIRECTIVES } from '@azlabsjs/ngx-file-input';
import { NgxCommonModule } from './common';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, eyeHideIcon, eyeIcon } from '@cds/core/icon';
import { DIRECTIVES } from './directives';
import { PIPES } from './pipes';

// Register clarity eye icons
ClarityIcons.addIcons(eyeHideIcon, eyeIcon);

@Component({
  standalone: true,
  imports: [
    NgxCommonModule,
    FormsModule,
    ReactiveFormsModule,
    ...DIRECTIVES,
    ...FILE_INPUT_DIRECTIVES,
    ClarityModule,
    ...PIPES
  ],
  selector: 'ngx-clr-form-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFormControlComponent implements OnDestroy, AfterContentInit {
  //#region component inputs
  @Input() inline = false;
  @Input() describe = true;
  @Input() countries!: string[];
  private _inputConfig!: InputConfigInterface;
  @Input() set config(value: InputConfigInterface) {
    this._inputConfig = value;
  }
  /** @deprecated */
  @Input() set inputConfig(value: InputConfigInterface) {
    this._inputConfig = value;
  }
  get inputConfig() {
    return this._inputConfig;
  }
  /** @deprecated */
  @Input({ alias: 'class' }) cssClass = 'clr-form-control';
  @Input({ alias: 'control' }) formControl!: FormControl<any>;
  @Input() label!: TemplateRef<any>;
  @Input() error!: TemplateRef<any>;
  /** HTML/Text View template input */
  @Input() textView!: TemplateRef<any>;
  //#endregion

  //#region component outputs
  @Output() valueChange = new EventEmitter<InputEventArgs>();
  @Output('item-removed') remove = new EventEmitter<any>();
  @Output('item-selected') selected = new EventEmitter<InputEventArgs>();
  @Output('file-added') fileAdded = new EventEmitter<any>();
  @Output('file-removed') fileRemoved = new EventEmitter<any>();
  @Output('focus') focus = new EventEmitter<InputEventArgs>();
  @Output('keydown') keydown = new EventEmitter<InputEventArgs>();
  @Output('keyup') keyup = new EventEmitter<InputEventArgs>();
  @Output('keypress') keypress = new EventEmitter<InputEventArgs>();
  @Output('blur') blur = new EventEmitter<InputEventArgs>();
  //#endregion

  //#region class properties
  private subscriptions: Subscription[] = [];
  readonly inputTypes = InputTypes;
  //#endregion

  /** @description Creates an instance of Form Control Component */
  constructor(private cdRef: ChangeDetectorRef) {}

  ngAfterContentInit() {
    if (!this.formControl) {
      return;
    }

    this.subscriptions.push(
      this.formControl.valueChanges
        .pipe(
          map((source) => ({ name: this.inputConfig.name, value: source })),
          tap((event) => {
            this.valueChange.emit(event);
            this.cdRef?.markForCheck();
          })
        )
        .subscribe(),
      this.formControl.statusChanges.subscribe(() => this.cdRef?.markForCheck())
    );
  }

  onBlur(event: Event, name: string) {
    this.blur.emit({ name, value: event });
  }

  onKeyPress(event: Event, name: string) {
    this.keypress.emit({ name, value: event });
  }

  onKeyDown(event: Event, name: string) {
    this.keydown.emit({ name, value: event });
  }

  onKeyUp(event: Event, name: string) {
    this.keyup.emit({ name, value: event });
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
