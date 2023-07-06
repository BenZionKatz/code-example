import { BtFetching,BtEFetchingStatus} from './BtFetching';
import {Injector, Injectable, ReflectiveInjector, ɵConsole} from '@angular/core'
import { BehaviorSubject, Observable, Subscriber, Subscription } from 'rxjs';
import {MonitoringService} from '../../services/monitoring/monitoring.service';
import * as _ from 'lodash';
import { BtLocalStorageService } from '../services/local-storage';
import { callbackify } from 'util';



interface INode{
  name:string,
  parent?:INode,
  children?:INode[]
}

interface IGetAllMembersAsTreeInput{
  object?:any,
  tree?:INode[],
  onlyFirstLevel?:boolean,
  parent?:INode 
}




abstract  class BtResponse {
    abstract error:boolean;
    abstract errorDet:number;
     __Fetching  = new BtFetching();
    private __isStrict:boolean = true;
    private __callbackResSuccess:CallableFunction[] = [];
    private __callbackResError:CallableFunction[] = [];
    private __localStorageService:any;
    private __behaviorSubject:BehaviorSubject<BtResponse>;
    private __behaviorSubjectForOneSession:BehaviorSubject<BtResponse>;
    private __LSkey:string;
    private __err;
    constructor(){
      
    this.__behaviorSubject = new BehaviorSubject(this);
    this.__behaviorSubjectForOneSession = new BehaviorSubject(this);      
    
    }


   /**
    * Fetch for an api and fill the object with the response
    * @param {Observable<any>} httpObservable 
    * @param {callbleFunction} callBackRes A callback for when the response
    *  from server succeed with the object itself as input parameter.
    * @param callBackErr 
    */
   fetch(httpObservable:Observable<any>,
        callBackRes:CallableFunction = null,
        callBackErr:CallableFunction = null):BtResponse{
     this.__err = null;
     this.__Fetching.fetch();
     this.__propagate();
     if(this.__localStorageService)
        this.__localStorageService.delete(this.__LSkey);
     httpObservable.subscribe(res => {
         this.__handleResponseFromServer(res);
         if(callBackRes)
            callBackRes(res);
     },err => {
       this.__handleError(err);
       if(callBackErr)
         callBackErr(err);
     })
     return this;
   }

   /**
    * Subscribe to CResponse object.
    *  
    * It handle like a behavior subject,
    * so for every change it will fire the callback.
    * @param callBack 
    */
  subscribe(callBack:CallableFunction):Subscription{
    if(!this.__behaviorSubject)
      return null;
    let subscription:Subscription = this.__behaviorSubject.subscribe(res => {
        callBack(res);
      })
    return subscription;
   }

   /**
    * * Subscribe to CResponse object only for one session 
    * (until we get a response of a HTTP call).
    *  
    * * By the time of the session it handles like a behavior subject,
    * so for every change (i.e state in the HTTP call) it will fire the callback.
    * @param callBack 
    */
   subscribeForOneSession(callBack:CallableFunction):Subscription{
    if(!this.__behaviorSubjectForOneSession)
      return null;
    let subscription:Subscription = this.__behaviorSubjectForOneSession.subscribe(res => {
        callBack(res);
      })
    return subscription;
   }

   
  

  
  private  __handleResponseFromServer(resFromServer:any = {}):boolean {
    if(!resFromServer){
      this.__handleError(-1);
      return false;
    }
    let isJsonValid = this.__checkOneWaySimilarity(resFromServer,this,[]);
    if(!isJsonValid)
      this.__setResJSONinvalid();
    if(isJsonValid)
       this.fill(resFromServer);
       this.__setResSuccess();
    this.__propagate(true);
    this.__setLocalStorage();
    return isJsonValid;
  }
  
  private __handleError = (err) => {
    this.__err = err;
     this.setHttpError(err);
     this.__propagate(true);
     this.__setLocalStorage();
  }

   setHttpError (err):void{
    if(err !== 0)
        this.__Fetching.setHttpError();
    if (err === 0)
        this.__Fetching.setNoConnection();
    if(this.__callbackResError)
        this.__callbackResError.map(callback => callback(err));
  }
 
   fill (res) {
     _.assign(this,res)
  
   }

   /**
    * 
    * @param key 
    */

   resetLS (key = this.constructor.name){
    if(!this.__LSkey)
       this.__LSkey = key;
    if(!this.__localStorageService){
       let injector = ReflectiveInjector.resolveAndCreate([BtLocalStorageService]);
       this.__localStorageService = injector.get(BtLocalStorageService);
    }
     this.__localStorageService.delete(this.__LSkey);
     return this;
   }

  private __checkOneWaySimilarity(res:any,
        object:Object,traces:string[]):boolean{
    return true;
  }


  /**
   * 
   * @param complete 
   */
 private __propagate (complete:boolean = false) {
   if(this.__behaviorSubject){
     this.__behaviorSubject.next(this);
    }
    if(this.__behaviorSubjectForOneSession){
       this.__behaviorSubjectForOneSession.next(this);
     if(complete)
       this.__behaviorSubjectForOneSession.complete();
    }
}
  

private __setLocalStorage () {
   //to not make infinite circular structure
  
  if(this.__localStorageService){
    let thisObject:any = {}
    //block circular structure
    Object.keys(this).map(prop => {
      if(prop !== '__behaviorSubject' && prop !== '__behaviorSubjectForOneSession')
      thisObject[prop] = this[prop]
    })
    this.__localStorageService.set(this.__LSkey,thisObject);
  } 
}

/**
 * Fill the object with content from local storage.
 * @param {string} key index key in the local storage.
 */
  getFromLS (key = this.constructor.name) {//attention ! this can cause bugs in prod env
    this.__LSkey = key;
    let injector = ReflectiveInjector.resolveAndCreate([BtLocalStorageService]);
    this.__localStorageService = injector.get(BtLocalStorageService);
     let fromLocalStorage = this.__localStorageService.get(this.__LSkey);
     if(fromLocalStorage)
     _.merge(this,fromLocalStorage);
     return this; //chaining pattern
 }

    setNotDirty(){
      this.__Fetching.setNotDirty();
      this.__behaviorSubject.next(this)
    }
 

/**
 * * Callback to fire when (and if) the response from server will success (with status 200 OK).
 * 
 * * ! If the response from the last fetch has already succeeded and 
 * there are not yet any current fetch,
 *then the callback will fires immediately.
 * @param {CallableFunction} callBack 
 */
/* need to implement a way to unsubscribe to the callback */
onResSuccess = (callBack:CallableFunction) => {
  if(this.isResSuccess()){
    callBack(this);
    return this; //chaining pattern
  }
  this.__callbackResSuccess.push(callBack);
  return this; //chaining pattern
 }

 /**
 * * Callback to fire when (and if) the response from server will success (with ERROR statuses).
 * 
 * * ! If the response of  the last fetch has already failed and 
 * there are not yet any current fetch,
 * then the callback will fires immediately.
 * @param {CallableFunction} callBack 
 */
onResError = (callBack:CallableFunction) => {
  if(this.isResError()){
    callBack(this.__err);
    return this; //chaining pattern
  }
  this.__callbackResError.push(callBack);
 return this; //chaining pattern
}

/**
 * *  Callback to fire when we get a response from server.
 * 
 * * ! If we alredy get a response  of  the last fetch  and 
 * there are not yet any current fetch,
 * then the callback will fires immediately.
 * @param callBackRes 
 * @param callBackErr 
 */
onRes(callBackRes:CallableFunction,callBackErr?:CallableFunction){
  this.onResSuccess(callBackRes);
  if(callBackErr)
     this.onResError(callBackErr)
  return this;
}

 
/*private setters*/ 
private __setResJSONinvalid():void{
  this.__Fetching.setResJsonInvalid();
}

private __setResSuccess():void{
  this.__Fetching.setResSuccess();
  if(this.__callbackResSuccess)
    this.__callbackResSuccess.map(callback => callback(this));
  this.__callbackResSuccess = [];
  }

  /*getters*/ 

  /**
   * 
   */
  public isResSuccess = ():boolean => {
        return this.__Fetching.fetchingStatus === BtEFetchingStatus.VALID;
    }

    /**
     * 
     */
    isResError():boolean {
      return this.getStatus() > 2 && !this.isResSuccess();
    }

    /**
     * 
     */
    isFetchedOnce():boolean {
       return this.getStatus() > 1;
    }
/**
 * 
 */
    isFetching = ():boolean => {
        return this.__Fetching.fetchingStatus === BtEFetchingStatus.FETCHING;
    }
  
    /**
     * 
     */
    getStatus():BtEFetchingStatus{
        return this.__Fetching.fetchingStatus;
    }
  
}
        
function _fetch(CRes:BehaviorSubject<BtResponse>):void  {
  CRes.value.__Fetching.fetch();
  CRes.next(CRes.value);
}

function fill(CRes:BehaviorSubject<BtResponse>,
  res:any,serviceName:string = ''):any{
  let initialize =  CRes.value.fill(res);
  CRes.value.__Fetching.setResSuccess();
  CRes.next(CRes.value);
/*
  console.log(serviceName + 'response from server does \
     not match the class \n this is the response \
     properties members',Object.getOwnPropertyNames(res) ,
      'and this is the class properties members',
      Object.getOwnPropertyNames(CRes.value))
  */
/*
  console.log(serviceName + ':response from server successfully',
   'response from server:',res,'\n',
   'class',CRes.value)
 */
}


function handleError(CRes:BehaviorSubject<BtResponse>,
                   err:any,
                   serviceName:string = ''):void{
  console.log(serviceName + ':error from server',err)
  CRes.value.setHttpError(err.status);
  CRes.next(CRes.value);
}


export{BtResponse,fill,handleError,_fetch}





 
