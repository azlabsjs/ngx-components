import {
  InputConfigInterface,
  InputTypes,
  OptionsInputItemsInterface,
} from '../../../core';
import { AbstractControl, FormControl } from '@angular/forms';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { InputEventArgs } from '../../types';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { InputTypeHelper } from '../../services';

@Component({
  selector: 'ngx-smart-form-control',
  templateUrl: './ngx-smart-form-control.component.html',
  styles: [
    `
      :host ::ng-deep span.input__subtext, :host ::ng-deep .input__subtext {
        display: block;
        margin-top: 0.3rem;
        font-size: 0.55rem;
        line-height: 0.6rem;
      }

      :host ::ng-deep span.input__error_text, :host ::ng-deep .input__error_text {
        line-height: .6rem;
        left: 0;
        /* background: #ff494f; */
        border-radius: 5px;
        color: #ff494f; /** Previous value : #fff */
        /* padding: 2px 10px; */
        font-size: .55rem;
      }
    `,
  ],
})
export class NgxSmartFormControlComponent implements OnDestroy, OnInit {
  // Component properties
  public inputTypes = InputTypes;
  private _destroy$ = new Subject<void>();

  //#region Component inputs
  @Input() class: string = 'clr-form-control';
  @Input() inline: boolean = false;
  @Input() describe = true;
  @Input() inputConfig!: InputConfigInterface;
  @Input() listItems!: OptionsInputItemsInterface;
  @Input() control!: AbstractControl & FormControl;
  //#endregion Component inputs

  //#region Component outputs
  @Output() remove = new EventEmitter<any>();
  @Output() selected = new EventEmitter<InputEventArgs>();
  @Output() fileAdded = new EventEmitter<any>();
  @Output() fileRemoved = new EventEmitter<any>();
  @Output('focus') focus = new EventEmitter<InputEventArgs>();
  @Output('keydown') keydown = new EventEmitter<InputEventArgs>();
  @Output('keyup') keyup = new EventEmitter<InputEventArgs>();
  @Output('keypress') keypress = new EventEmitter<InputEventArgs>();
  @Output('blur') blur = new EventEmitter<InputEventArgs>();
  // Value changes emitters
  @Output() valueChange = new EventEmitter<InputEventArgs>();
  //#endregion Component outputs

  constructor(public readonly inputType: InputTypeHelper) {}

  ngOnInit() {
    this.control.valueChanges
      .pipe(
        takeUntil(this._destroy$),
        tap((source) =>
          this.valueChange.emit({
            name: this.inputConfig.formControlName,
            value: source,
          })
        )
      )
      .subscribe();
  }

  getInlineTextAreaInput(input: InputConfigInterface) {
    return {
      ...input,
      classes: input.classes?.includes('clr-textarea')
        ? input.classes?.replace('textarea', 'input')
        : `${input?.classes} clr-input`,
    };
  }

  radioBoxLabel(name: string, value: string) {
    return `${name}_${value}`;
  }

  ngOnDestroy() {
    this._destroy$.next();
  }
}
