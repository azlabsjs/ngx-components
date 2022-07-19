import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import {
  DropzoneComponentInterface,
  DropzoneConfig,
} from '@azlabsjs/ngx-dropzone';

@Component({
  selector: 'ngx-smart-dz',
  template: `
    <ngx-dropzone
      #dropzoneContainer
      *ngIf="config"
      [config]="config"
      (removedFile)="dzoneremove($event)"
      (addedFile)="dzoneadd()"
      (reset)="reset.emit($event)"
      [uploadFileText]="'uploadFileLabel' | templateDict"
      [dragFileText]="'dragFileLabel' | templateDict"
      [defaultMessage]="'clickUploadButtonLabel' | templateDict"
    >
      <ng-template #dzuploadbutton>
        <clr-icon shape="upload-cloud"></clr-icon>
      </ng-template>
    </ngx-dropzone>
  `,
  styles: [``],
})
export class NgxSmartDzComponent {
  //#region Component inputs
  @Input() config!: DropzoneConfig;
  @Input() multiple: boolean = false;
  @Input() set disabled(value: boolean) {
    if (this.dropzoneContainer) {
      this.dropzoneContainer.disabled = value;
    }
  }
  //#region Components inputs

  //#region Component outputs
  @Output() removed = new EventEmitter();
  @Output() acceptedFiles = new EventEmitter<File[]>();
  @Output() reset = new EventEmitter<unknown>();
  //#endregion Component outputs

  //#region View Componenents
  @ViewChild('dropzoneContainer')
  dropzoneContainer!: DropzoneComponentInterface;
  //#endregion View Componenents

  // tslint:disable-next-line: typedef
  async dzoneadd() {
    const timeout = setTimeout(async () => {
      const files = this.dropzoneContainer.dropzone().getAcceptedFiles();
      this.acceptedFiles.emit(files);
      if (!this.multiple) {
        this.dropzoneContainer.disabled = true;
      }
      clearTimeout(timeout);
    }, 50);
  }

  // tslint:disable-next-line: typedef
  dzoneremove(event: any) {
    // Enable the dropzpone if an item is removed from the dropzone and not supporting multiple upload
    if (!this.multiple) {
      this.dropzoneContainer.disabled = false;
    }
    this.removed.emit(event);
  }
}
