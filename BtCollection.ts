import sha1 from 'crypto-js/sha1';



class BtCollection<props extends string> {
   
    private _collection:{[prop in props]?:any}[];
    // "flyWeight" ,pattern. 
    private _arraysByProp:{[prop in props]?:string[]} = {}
    /*private mappers to speed up the match kod parit and teur pair*/ 
    private _mapper:{[propValue in string]:any } = {}
    //hash value for comparing
    private _hash:any = null;
    constructor(collection:{[prop in props]?:any}[]){
       this._collection = collection;
    }
   
    // fetchers
    findFirst(prop:props,value:any):any{
         return this._mapper[`${prop}?${value}`] 
            || this._addToMapper(prop,value);
       }

    findAll(prop:props,value:any):any{
           return this._mapper[`${prop}?${value}`] 
             || this._addToMapper(prop,value);
        }
  
    findLast(prop:props,value:any):any{
             return this._mapper[`${prop}?${value}`] 
              || this._addToMapper(prop,value);
          }
      
    
    get():{[prop in props]?:any}[]{
      return this._collection;
    }


    //ACTIONS
    set(collection:{[prop in props]?:any}[]){
      this._collection =  collection;
      this._initializeHelpers();
      return this;
    }

    push(record:{[prop in props]?:any}){
      this._collection.push(record);
      return this;
     }

    unshift(record:{[prop in props]?:any}){
      this._collection.unshift(record);
      return this;
    }

    sortBy(prop:props |props[] | Function | Function[],
      mode:'desc'|'asc'){
        return this;
    }


    //BOOLEANS
    includes(prop:props,value:any):boolean {
      if(this._mapper[`${prop}?${value}`] || this._addToMapper(prop,value))
         return true;
      return false;
    }

    compareWith(otherCollection:BtCollection<props>){
       return this._hash === otherCollection.asHash();
    }

    
    // transformators
    asArray(prop:props,options?:{
      removeDuplicate?:boolean
    }){
      return this._arraysByProp[prop] || this._buildArrayByProp(prop);
     }

    asStr(prop:props){

    }

    transformTo(){

    }

    public asHash(){
      return this._hash; 
    }

    

   

    

    private _setHash(){
       let str = JSON.stringify(this._collection)
       this._hash = sha1(str);
    }

    private _initializeHelpers(){
      this._mapper = {};
      this._arraysByProp = {}
      this._setHash();
    }

   
    private _buildArrayByProp(prop:props):string[]{
        this._arraysByProp[prop] = this._collection.map(record => {
          return (record[prop])})
        return <string[]>this._arraysByProp[prop]
    }

   
   
    private _addToMapper(prop:props,value){
        for(let itm of this._collection){
          if(itm[prop] === value){
             this._mapper[`${prop}?${value}`] = itm;
             return this._mapper[`${prop}?${value}`];
          }
       }
      return this._mapper[`${prop}?${value}`];
    }
}
    

export {
   BtCollection
  }


    /*
        for(let ctg in this.dropDowns){
            for(let itm in this.dropDowns[ctg]){
                if(this.dropDowns[ctg][itm].KodParit === KodParit)
                  return this.dropDowns[ctg][itm].TeurParit;
            }
          }
          return null;*/

          /*
       for(let ctg in this.dropDowns){
         for(let itm in this.dropDowns[ctg]){
             if(this.dropDowns[ctg][itm].TeurParit === TeurParit){
              return this.dropDowns[ctg][itm].KodParit;
             }
               
         }
       }
       return null;
    }*/