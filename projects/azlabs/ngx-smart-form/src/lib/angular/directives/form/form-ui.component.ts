import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Input,
  TemplateRef,
} from '@angular/core';
import { NgxSmartFormArrayComponent } from '../array';
import { NgxSmartFormGroupHeaderPipe } from '../group';
import { NgxSmartFormControlArrayComponent } from '../control-array';
import { PIPES } from '../../pipes';
import { FormGroupState } from './types';
import { InputConfigInterface } from '@azlabsjs/smart-form-core';
import { ModalDirective } from '../modal';

@Component({
  selector: 'ngx-form-ui',
  standalone: true,
  templateUrl: './form-ui.component.html',

  imports: [
    CommonModule,
    NgxSmartFormArrayComponent,
    NgxSmartFormControlArrayComponent,
    NgxSmartFormGroupHeaderPipe,
    ...PIPES,
  ],
  styleUrls: ['./form-grid.scss', './form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NgxFormComponent {
  @Input() modal!: ModalDirective;
  @Input({ required: true }) state!: FormGroupState & { [k: string]: unknown };
  @Input({ required: true }) inputs!: InputConfigInterface[];
  @Input() template!: TemplateRef<any>;
  @Input({ alias: 'add-template' }) addTemplate!: TemplateRef<any>;
  @Input() label!: TemplateRef<any>;
  @Input() autoupload: boolean = false;
  @Input('no-grid-layout') noGridLayout = false;

  //#region projected content
  @ContentChild(ModalDirective) formmodal!: ModalDirective | null;
  //#endregion
}
