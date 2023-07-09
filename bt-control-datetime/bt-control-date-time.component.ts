import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as moment from 'moment';


type CriticalLevel = 'low'|'mild'|'high';
@Component({
  selector: 'bt-control-datetime',
  templateUrl: './bt-control-date-time.component.html',
  styleUrls: ['./bt-control-date-time.component.css']
})
export class BtControlDatetimeComponent implements OnInit {
  @Input()btDateTime:string = moment().toISOString();
  @Input()btRelativeTime = true;
  @Output()btDatetimeChanges = new EventEmitter();
  @Input()local = 'he';

  openDatePicker:boolean = false;
  isChanged:boolean = false;
  openMinutesInput:boolean = false;
  openHoursInput:boolean = false;
  dateDescription;
  timeDescription;
  hours;
  minutes;
  closePickerTimeOut;

  constructor(private ref: ChangeDetectorRef) { 
  }

  ngOnInit(): void {
      this.setMoments();
  }

  ngOnChanges(){
    this.setMoments();
   
  }

  over(){
    this.ref.detectChanges();
    setTimeout(()=>{
      this.ref.detectChanges();
    },0)
  }

  leave(){
    this.ref.detectChanges();
    setTimeout(()=>{
      this.ref.detectChanges();
    },100)
    
  }

  detectChanges(){
    this.ref.detectChanges();
  }
  onDatePickerOpenStateChanges(isOpen){
    this.ref.detectChanges();
    if(isOpen && this.closePickerTimeOut)
       clearTimeout(this.closePickerTimeOut);
    if(!isOpen){
      this.closePickerTimeOut = setTimeout(()=>{
        this.openDatePicker = false;
        this.ref.detectChanges();
      },300)
    }
  }

  onOpenDatePicker(event){
    this.openDatePicker = true;
    this.ref.detectChanges();
    let clientY = event.clientY;
    let clientX = event.clientX;
    setTimeout(()=>{
      (<any>document.elementFromPoint(clientX,clientY)).click();
      (<any>document.elementFromPoint(clientX,clientY)).focus();
      this.ref.detectChanges();
    },50)
  }
  
  onChangeDate(event: Date): void {
   let nMoment = moment(event)
    let y = nMoment.get('year');
    let m = nMoment.get('month');
    let d = nMoment.get('date');
    this.btDateTime = moment(this.btDateTime).set({y:y,month:m,date:d}).toISOString();
    this.btDatetimeChanges.emit(this.btDateTime);
    this.setMoments();
  }

  onChangeTime(e){
    if(e)
    this.onBlur();
    this.setMoments();
  }

  onBlur(){
    this.btDatetimeChanges.emit(this.btDateTime);
    this.setMoments();
    this.ref.detectChanges();
  }

  getDate(){
    let d = new Date()
    return d;
  }

  setTimeDescription(){
    let tm = moment(this.btDateTime).locale(this.local).format('LT');
    let t = new Date(this.btDateTime);
      this.timeDescription =   t; 
  }

  setDateDescription(){
    this.dateDescription = moment(this.btDateTime).locale(this.local).startOf('days')
    .format('DD/MM');  
  }

  getTimeDescription(){
    return this.timeDescription;
  }

  getDateDescription(){
    return this.dateDescription
  }

  getFullDateTimeDescription(){
    return moment(this.btDateTime).locale(this.local).calendar();
  }

  setMinutes(){
    this.minutes = moment(this.btDateTime).format('mm');
  }

  getMinutes(){
    return this.minutes;
  }

  setHours(){
    this.hours = moment(this.btDateTime).format('HH');
  }

  getHours(){
    return this.hours;
  }

  onBlurHours(){
    this.openHoursInput = false;
    this.ref.detectChanges();
  }

  onBlurMinutes(){
    this.btDatetimeChanges.emit(this.btDateTime);
    this.openMinutesInput = false;
    this.ref.detectChanges();
  }

  onClickMinutes(){
    this.openMinutesInput = true;
    setTimeout(()=>{
      let input = document.getElementById('input-minutes');
      if(input)
        input.focus();
        (<any>input).select();
    },100)
  }
  onClickHours(){
    this.openHoursInput = true;
    setTimeout(()=>{
      let input = document.getElementById('input-hours');
      if(input)
        input.focus();
        (<any>input).select();
    },100)
    
  }

  onInputMinutes(event:any){
    if(event.target.value.length !== 2 )return;
    let minutes = parseInt(event.target.value);
    if(isNaN(minutes)|| minutes > 59 || minutes < 0){
      return
    }
    this.btDateTime = moment(this.btDateTime).set({minutes:minutes}).toISOString();
    // this.btDatetimeChanges.emit(this.btDateTime);
    this.setMoments();
    this.onBlurMinutes();
     }

  onInputHours(event){
    if(event.target.value.length !== 2 )return;
    let hours = parseInt(event.target.value);
    if(isNaN(hours)|| hours > 23 || hours < 0){
      return
    }
    this.btDateTime = moment(this.btDateTime).set({hours:hours}).toISOString();
    this.setMoments();
    this.onClickMinutes();
    this.ref.detectChanges();
  }

  private setMoments(){
    this.setDateDescription();
    this.setTimeDescription();
    this.setHours();
    this.setMinutes();
  }
}