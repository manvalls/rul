/**/ "use strict" /**/
var Detacher = require('detacher'),

    isRul = '3Vvw4Kb8NwR1Y74',
    volatile = Symbol(),
    consumable = Symbol(),
    consumers = Symbol(),
    length = Symbol(),
    list = Symbol(),
    readOnly = Symbol();

class Rul{

  static is(obj){
    return !!(obj && obj[isRul]);
  }

  constructor(vol){
    this[volatile] = !!vol;
    this[consumable] = true;
    this[length] = 0;
    this[list] = [];
    this[consumers] = new Set();
  }

  indexOf(elem){
    if(!this[consumable]) return -1;
    return this[list].indexOf(elem);
  }

  lastIndexOf(elem){
    if(!this[consumable]) return -1;
    return this[list].lastIndexOf(elem);
  }

  get(index){
    if(!this[consumable]) return;
    return this[list][index];
  }

  [Symbol.iterator](){
    if(!this[consumable]) return noop();
    return this[list][Symbol.iterator]();
  }

  append(it){
    var elem;
    for(elem of it) this.add(elem);
  }

  add(elem,index){
    var c;

    if(this[readOnly]) return;
    if(arguments.length == 1) index = this[length];
    else index = Math.round(Math.max(0,Math.min(this[length],index)));

    this[length]++;
    if(this[consumable]) this[list].splice(index,0,elem);
    for(c of this[consumers]) c[0].call(c[3],elem,index);

  }

  replace(index,elem){
    if(index < this[length] && index >= 0) this.remove(index);
    this.add(elem,index);
  }

  remove(index,num){
    var c;

    if(this[readOnly]) return;
    index = Math.round(Math.max(0,Math.min(this[length] - 1,index)));
    if(arguments.length == 1) num = 1;
    else num = Math.round(Math.max(0,Math.min(this[length] - index,num)));

    if(!num) return;
    this[length] -= num;

    if(this[consumable]) this[list].splice(index,num);
    for(c of this[consumers]) c[1].call(c[3],index,num);

  }

  clear(){
    this.remove(0,this[length]);
  }

  move(from,to){
    var c,elem;

    if(this[readOnly]) return;
    from = Math.round(Math.max(0,Math.min(this[length] - 1,from)));
    to = Math.round(Math.max(0,Math.min(this[length] - 1,to)));

    if(this[consumable]){
      elem = this[list].splice(from,1)[0];
      this[list].splice(to,0,elem);
    }

    for(c of this[consumers]) c[2].call(c[3],from,to);
  }

  swap(from,to){
    var first = from < to ? from : to,
        second = to > from ? to : from;

    first = Math.round(Math.max(0,Math.min(this[length] - 1,first)));
    second = Math.round(Math.max(0,Math.min(this[length] - 1,second)));

    if(second <= first) return;
    this.move(first,second);
    this.move(second - 1,first);
  }

  consume(onAdd,onRemove,onMove,thisArg){
    var i;

    thisArg = thisArg || this;
    if(!this[consumable]) return new Detacher();
    if(this[volatile]) setTimeout(evaporate,0,this);
    this[consumers].add(arguments);

    for(i = 0;i < this[list].length;i++) arguments[0].call(thisArg,this[list][i],i);
    return new Detacher(detach,[arguments,this]);
  }

  map(map,thisArg){
    var rul = new Rul();

    this.consume(mapAdd,forwardRemove,forwardMove,{
      destination: rul,
      thisArg: thisArg,
      map: map
    });

    rul[readOnly] = true;
    return rul;
  }

  readOnly(){
    var rul = new Rul();

    this.consume(forwardAdd,forwardRemove,forwardMove,{
      destination: rul
    });

    rul[readOnly] = true;
    return rul;
  }

  get consumable(){ return this[consumable]; }
  get volatile(){ return this[volatile]; }
  get length(){ return this[length]; }
  get [isRul](){ return true; }

}

// - utils

function* noop(){}

function evaporate(rul){
  delete rul[list];
  rul[consumable] = false;
}

function detach(args,rul){
  rul[consumers].delete(args);
}

function mapAdd(elem,index){
  try{ elem = this.map.call(this.thisArg,elem); }
  catch(e){ }

  this.destination[readOnly] = false;
  this.destination.add(elem,index);
  this.destination[readOnly] = true;
}

function forwardAdd(elem,index){
  this.destination[readOnly] = false;
  this.destination.add(elem,index);
  this.destination[readOnly] = true;
}

function forwardRemove(index,num){
  this.destination[readOnly] = false;
  this.destination.remove(index,num);
  this.destination[readOnly] = true;
}

function forwardMove(from,to){
  this.destination[readOnly] = false;
  this.destination.move(from,to);
  this.destination[readOnly] = true;
}

/*/ exports /*/

module.exports = Rul;
