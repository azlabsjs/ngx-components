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
import {
  FormControl,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { InputConfigInterface, InputTypes } from '@azlabsjs/smart-form-core';
import { Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { InputEventArgs } from './types';
import { FILE_INPUT_DIRECTIVES } from '@azlabsjs/ngx-file-input';
import { NgxCommonModule } from './common';
import { DIRECTIVES } from './components';
import { ClarityModule } from '@clr/angular';
import { ClarityIcons, eyeHideIcon, eyeIcon } from '@cds/core/icon';

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
  ],
  selector: 'ngx-clr-form-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// ControlValueAccessor
export class NgxFormControlComponent implements OnDestroy, OnInit {
  // Component properties
  inputTypes = InputTypes;

  //#region Component inputs
  @Input() inline = false;
  @Input() describe = true;
  @Input() class = 'clr-form-control';
  @Input() inputConfig!: InputConfigInterface;
  @Input({ alias: 'control' }) formControl!: FormControl<any>;
  @Input({ alias: 'countries' }) preferredCountries!: string[];
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
  private subscriptions: Subscription[] = [];
  //#endregion Class properties

  /** @description Creates an instance of Form Control Component */
  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.subscriptions.push(
      // Trigger change detection whenever control value changes
      this.formControl.valueChanges
        .pipe(
          map((source) => ({ name: this.inputConfig.name, value: source })),
          tap((event) => {
            this.valueChange.emit(event);
            this.cdRef?.markForCheck();
          })
        )
        .subscribe(),

      // Mark the component as dirty whenever control status changes
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
