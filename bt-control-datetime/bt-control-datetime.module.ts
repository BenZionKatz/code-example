import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BtControlDatetimeComponent} from "./bt-control-date-time.component";
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { MatIconModule } from '@angular/material/icon';
import {FormsModule} from "@angular/forms"
import { NzInputModule } from 'ng-zorro-antd/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [BtControlDatetimeComponent],
  imports: [
    CommonModule,
    NzDatePickerModule,
    NzInputModule,
    MatIconModule,
    FormsModule,
    MatTooltipModule
  ],
  exports:[BtControlDatetimeComponent]
})
export class BtControlDatetimeModule { }
