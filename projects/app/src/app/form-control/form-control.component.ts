import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
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
    disabled: false,
    readOnly: false,
    description: 'Upload file to server',
    hidden: false,
    isRepeatable: false,
    containerClass: 'clr-col-4',
    rules: {
      isRequired: false,
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
    disabled: false,
    readOnly: false,
    hidden: false,
    isRepeatable: false,
    containerClass: 'clr-col-4',
  };

  dateInputControl = new FormControl();
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
  };

  numberInputControl = new FormControl();
  numberInput: NumberInput = {
    min: 0,
    label: 'Taxes',
    type: 'number',
    name: 'tax',
    classes: 'clr-input',
    isRepeatable: false,
    containerClass: 'clr-col-6',
  };

  textInputControl = new FormControl();
  textInput: TextInput = {
    label: 'Firstname',
    type: 'text',
    name: 'name',
    classes: 'clr-input',
    isRepeatable: false,
    containerClass: 'clr-col-6',
  };

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

  private subscriptions: Subscription[] = [];

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
    ];
  }

  ngOnDestroy() {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
  }
}
