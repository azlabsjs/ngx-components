import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DropdownComponent } from './dropdown.component';
import { DropdownSearchComponent } from './search.component';

@NgModule({
  declarations: [DropdownSearchComponent, DropdownComponent],
  imports: [CommonModule, FormsModule],
  exports: [DropdownSearchComponent, DropdownComponent],
})
export class DropdownModule {}
