import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { NgxFormControlComponent } from '@azlabsjs/ngx-clr-form-control';
import { createFormControl } from '@azlabsjs/ngx-smart-form';
import {
  DateInput,
  FileInput,
  NumberInput,
  TextAreaInput,
  TextInput,
  TimeInput,
} from '@azlabsjs/smart-form-core';
import { Subscription, tap } from 'rxjs';

@Component({
  standalone: true,
  imports: [CommonModule, NgxFormControlComponent],
  selector: 'app-form-control',
  templateUrl: './form-control.component.html',
})
export class FormControlComponent implements OnInit, OnDestroy {
  //
  autoUploadFileControl = new FormControl();
  autoUploadFile: FileInput = {
    uploadUrl: 'https://storagev2.lik.tg/api/storage/object/upload',
    pattern: 'image/*',
    multiple: false,
    maxFileSize: 12,
    autoupload: true,
    uploadAs: 'content',
    label: 'Auto upload file',
    type: 'file',
    name: 'file_id',
    classes: 'clr-input',
    description: 'Upload file to server',
    hidden: false,
    isRepeatable: false,
    containerClass: 'clr-col-4',
    read: 'url',
    constraints: {
      required: false,
      disabled: false,
    },
  };

  fileControl = new FormControl();
  fileInput = {
    uploadUrl: 'https://storagev2.lik.tg/api/storage/object/upload',
    pattern: 'image/*',
    multiple: false,
    maxFileSize: 12,
    autoupload: false,
    uploadAs: 'content',
    label: 'No auto upload file',
    type: 'file',
    name: 'file2_id',
    classes: 'clr-input',
    hidden: false,
    isRepeatable: false,
    containerClass: 'clr-col-4',
    constraints: {
      required: true,
    },
  };

  dateInput: DateInput = {
    minDate: '',
    maxDate: '',
    currentDate: new Date().toLocaleDateString(),
    label: 'Date',
    type: 'date',
    name: 'date',
    classes: 'clr-date',
    isRepeatable: false,
    containerClass: 'clr-col-6',
    constraints: {
      required: true,
      max: new Date(),
    },
  };
  dateInputControl = createFormControl(this.fb, this.dateInput);

  numberInput: NumberInput = {
    min: 0,
    label: 'Taxes',
    type: 'number',
    name: 'tax',
    classes: 'clr-input',
    isRepeatable: false,
    containerClass: 'clr-col-6',
    constraints: {
      required: true,
      max: 10,
    },
  };
  numberInputControl = createFormControl(this.fb, this.numberInput);

  textInput: TextInput = {
    label: 'Firstname',
    type: 'text',
    name: 'name',
    classes: 'clr-input',
    isRepeatable: false,
    containerClass: 'clr-col-6',
    constraints: {
      required: true,
      max: 50,
    },
  };
  textInputControl = createFormControl(this.fb, this.textInput);

  textAreaInputControl = new FormControl();
  textAreaInput: TextAreaInput = {
    cols: 0,
    rows: 0,
    maxLength: 0,
    label: 'Description',
    type: 'textarea',
    name: 'description',
    classes: 'clr-textarea',
    isRepeatable: false,
    containerClass: 'clr-col-12',
  };

  timeInputControl = new FormControl();
  timeInput: TimeInput = {
    min: '',
    label: 'Time',
    type: 'time',
    name: 'at',
    classes: 'clr-input',
    isRepeatable: false,
    containerClass: 'clr-col-12',
  };

  phoneInput: TextInput = {
    label: 'Phone number',
    type: 'phone',
    name: 'phone_number',
    classes: 'clr-input',
    isRepeatable: false,
    containerClass: 'clr-col-6',
    constraints: {
      required: true,
      max: 20,
    },
  };
  phoneInputControl = createFormControl(this.fb, this.phoneInput);

  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.subscriptions = [
      this.fileControl.valueChanges
        .pipe(
          tap((state) => {
            console.log('File value changes...', state);
          })
        )
        .subscribe(),
      this.timeInputControl.valueChanges
        .pipe(
          tap((state) => {
            console.log('Time value changes...', state);
          })
        )
        .subscribe(),

      this.autoUploadFileControl.valueChanges
        .pipe(
          tap((state) => {
            console.log('Auto upload control value changes...', state);
          })
        )
        .subscribe(),

      this.dateInputControl.valueChanges
        .pipe(
          tap(() => {
            console.log(this.dateInputControl);
          })
        )
        .subscribe(),
    ];
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
