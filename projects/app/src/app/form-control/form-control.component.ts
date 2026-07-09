import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CLR_FORM_CONTROL_DIRECTIVES,
  NgxFormControlComponent,
  NgxInputErrorComponent,
} from '@azlabsjs/ngx-clr-form-control';
import {
  createFormControl,
  FORM_DIRECTIVES,
  NgxFormComponent,
} from '@azlabsjs/ngx-smart-form';
import {
  FormConfigInterface,
  InputConfigInterface,
  OptionsInput,
  OptionsInputConfigInterface,
} from '@azlabsjs/smart-form-core';
import { Subscription, tap } from 'rxjs';
import { ClrIconModule } from '@clr/angular';
import { COMMON_PIPES } from '@azlabsjs/ngx-common';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CLR_FORM_CONTROL_DIRECTIVES,
    ...FORM_DIRECTIVES,
    NgxInputErrorComponent,
    ClrIconModule,
    ...COMMON_PIPES,
  ],
  selector: 'app-form-control',
  styles: [
    `
      .tooltip-content.error {
        background-color: #ff494f !important;
      }
      .tooltip-content.error::before {
        border-left: 0.3rem solid #ff494f !important;
        border-left-color: #ff494f !important;
        border-top: 0.25rem solid #ff494f !important;
        border-top-color: #ff494f !important;
        border-right: 0.3rem solid transparent;
        border-bottom: 0.25rem solid transparent;
      }
    `,
  ],
  templateUrl: './form-control.component.html',
})
export class FormControlComponent {
  form = {
    id: '',
    title: '',
    controlConfigs: [
      {
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
          min: '1950-01-01',
          max: new Date().toISOString().split('T')[0],
        },
      },
      {
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
      },
      {
        label: 'Firstname',
        type: 'text',
        name: 'name',
        classes: 'clr-input',
        isRepeatable: false,
        containerClass: 'clr-col-6',
        constraints: {
          requiredIf: [
            {
              name: 'tax',
              values: 'gt:18',
            },
            // {
            //   name: 'date',
            //   values: 'yeardiff_gte:18',
            // },
          ],
          max: 50,
        },
      } as InputConfigInterface,
      {
        cols: 0,
        rows: 0,
        maxLength: 0,
        label: 'Description',
        type: 'textarea',
        name: 'description',
        classes: 'clr-textarea',
        isRepeatable: false,
        containerClass: 'clr-col-12',
      },
      {
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
      },
      {
        min: '',
        label: 'Time',
        type: 'time',
        name: 'at',
        classes: 'clr-input',
        isRepeatable: false,
        containerClass: 'clr-col-12',
      },
      {
        label: 'Sexe',
        name: 'sex',
        type: 'select',
        classes: 'clr-input',
        placeholder: '...',
        isRepeatable: false,
        containerClass: 'clr-col-6',
        options: [
          { name: 'FEMININ', value: 'F' },
          { name: 'MASCULIN', value: 'M' },
          // { name: 'AUTRES', value: 'O' }, # uncomment this line to add other as sex
        ],
        constraints: {
          required: true,
          disabled: false,
        },
      } as OptionsInput,
      {
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
      },
      {
        // uploadUrl: 'https://storagev2.lik.tg/api/storage/object/upload',
        pattern: 'image/*,application/pdf',
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
      },
      {
        label: 'modules.kyc.policyholders.person.columns.sex',
        name: 'pat_type_id',
        type: 'radio',
        classes: 'clr-input',
        placeholder: '...',
        value: null,
        description: '', // TODO: Add input description
        index: undefined,
        isRepeatable: false,
        containerClass: 'input-col-sm-12 input-col-md-6',
        options: [
          { name: 'FEMININ', value: 'F' },
          { name: 'MASCULIN', value: 'M' },
          { name: 'Autres', value: 'O' },
        ],
        constraints: {
          required: true,
          disabled: false,
          min: 1,
        },
      } as OptionsInputConfigInterface,
    ],
  } as FormConfigInterface;

  constructor(private fb: FormBuilder) {}
}
