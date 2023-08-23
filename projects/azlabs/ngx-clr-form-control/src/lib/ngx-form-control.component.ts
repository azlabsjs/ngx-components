import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { InputConfigInterface, InputTypes } from '@azlabsjs/smart-form-core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InputEventArgs } from './types';

@Component({
  selector: 'ngx-clr-form-control',
  templateUrl: './ngx-form-control.component.html',
  styleUrls: ['./ngx-form-control.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFormControlComponent implements OnDestroy, OnInit {
  // Component properties
  inputTypes = InputTypes;

  //#region Component inputs
  @Input() class: string = 'clr-form-control';
  @Input() inline: boolean = false;
  @Input() describe = true;
  @Input() inputConfig!: InputConfigInterface;
  @Input('control') formcontrol!: FormControl<any>;
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
  //#endregion Component outputs

  //#region Class properties
  subscriptions: Subscription[] = [];
  //#endregion Class properties

  /**
   * Creates an instance of Form Control Component
   *
   * @param changes
   */
  constructor(private changes: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscriptions.push(
      this.formcontrol.valueChanges
        .pipe(
          tap((source) => {
            this.valueChange.emit({
              name: this.inputConfig.name,
              value: source,
            });
            // Trigger a change detection to insure update tge UI component
            this.changes.markForCheck();
          })
        )
        .subscribe()
    );
  }

  updateinlineclass(inputConfig: InputConfigInterface) {
    return {
      ...inputConfig,
      classes: this.inline
        ? inputConfig.classes?.includes('clr-textarea')
          ? inputConfig.classes?.replace('textarea', 'input')
          : `${inputConfig?.classes}`
        : inputConfig?.classes,
    };
  }

  radiovalue(name: string, value: string) {
    return `${name}_${value}`;
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
