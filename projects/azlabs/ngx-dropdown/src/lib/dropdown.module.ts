import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from './dropdown.component';
import { DropdownSearchComponent } from './search.component';

@NgModule({
  declarations: [DropdownComponent, DropdownSearchComponent],
  imports: [CommonModule, FormsModule],
  exports: [DropdownComponent, DropdownSearchComponent],
})
export class DropdownModule {}
