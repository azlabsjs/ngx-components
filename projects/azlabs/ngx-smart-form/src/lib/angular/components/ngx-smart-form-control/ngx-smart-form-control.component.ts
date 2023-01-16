import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import { AbstractControl, UntypedFormControl } from '@angular/forms';
import {
  InputConfigInterface,
  InputOptionsInterface,
  InputTypes
} from '@azlabsjs/smart-form-core';
import { Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { InputTypeHelper } from '../../services';
import { InputEventArgs } from '../../types';

@Component({
  selector: 'ngx-smart-form-control',
  templateUrl: './ngx-smart-form-control.component.html',
  styles: [
    `
      :host ::ng-deep span.input__subtext,
      :host ::ng-deep .input__subtext {
        display: block;
        margin-top: 0.3rem;
        font-size: 0.55rem;
        line-height: 0.6rem;
      }

      :host ::ng-deep span.input__error_text,
      :host ::ng-deep .input__error_text {
        line-height: 0.6rem;
        left: 0;
        /* background: #ff494f; */
        border-radius: 5px;
        color: #ff494f; /** Previous value : #fff */
        /* padding: 2px 10px; */
        font-size: 0.55rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxSmartFormControlComponent implements OnDestroy, OnInit {
  // Component properties
  inputTypes = InputTypes;
  private _destroy$ = new Subject<void>();

  //#region Component inputs
  @Input() class: string = 'clr-form-control';
  @Input() inline: boolean = false;
  @Input() describe = true;
  @Input() inputConfig!: InputConfigInterface;
  @Input() options!: InputOptionsInterface;
  @Input('control') formcontrol!: AbstractControl & UntypedFormControl;
  //#endregion Component inputs

  //#region Component outputs
  @Output('item-removed') remove = new EventEmitter<any>();
  @Output('item-selected') selected = new EventEmitter<InputEventArgs>();
  @Output('file-added') fileAdded = new EventEmitter<any>();
  @Output('file-removed') fileRemoved = new EventEmitter<any>();
  @Output('focus') focus = new EventEmitter<InputEventArgs>();
  @Output('keydown') keydown = new EventEmitter<InputEventArgs>();
  @Output('keyup') keyup = new EventEmitter<InputEventArgs>();
  @Output('keypress') keypress = new EventEmitter<InputEventArgs>();
  @Output('blur') blur = new EventEmitter<InputEventArgs>();
  // Value changes emitters
  @Output() valueChange = new EventEmitter<InputEventArgs>();
  @Input() autoupload: boolean = false;
  @Input() submitupload: boolean = false;
  //#endregion Component outputs

  /**
   * Creates an instance of the Smart Form Control Component
   *
   * @param inputType
   * @param changes
   */
  constructor(
    public readonly inputType: InputTypeHelper,
    private changes: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.formcontrol.valueChanges
      .pipe(
        tap((source) => {
          this.valueChange.emit({
            name: this.inputConfig.name,
            value: source,
          });
          // Trigger a change detection to insure update tge UI component
          this.changes.markForCheck();
        }),
        takeUntil(this._destroy$)
      )
      .subscribe();
  }

  updateinlineclass(inputConfig: InputConfigInterface) {
    return {
      ...inputConfig,
      classes: inputConfig.classes?.includes('clr-textarea')
        ? inputConfig.classes?.replace('textarea', 'input')
        : `${inputConfig?.classes} clr-input`,
    };
  }

  radiovalue(name: string, value: string) {
    return `${name}_${value}`;
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
