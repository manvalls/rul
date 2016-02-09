var t = require('u-test'),
    assert = require('assert'),
    wait = require('y-timers/wait'),
    Rul = require('../main.js');

t('Rul',function(){

  t('indexOf',function(){
    var rul = new Rul(),
        obj = {};

    assert(Rul.is(rul));
    assert(!Rul.is(null));
    assert(!Rul.is({}));

    rul.add(1);
    rul.add(obj);
    rul.add(obj);
    rul.add(obj);
    rul.add(1);

    assert.strictEqual(rul.indexOf(obj),1);
    assert.strictEqual(rul.indexOf({}),-1);

    rul.replace(1,{});
    assert.strictEqual(rul.indexOf(obj),2);
  });

  t('lastIndexOf',function(){
    var rul = new Rul(),
        obj = {};

    rul.add(1);
    rul.add(obj);
    rul.add(obj);
    rul.add(obj);
    rul.add(1);

    assert.strictEqual(rul.lastIndexOf(obj),3);
    assert.strictEqual(rul.lastIndexOf({}),-1);

    rul.replace(3,{});
    assert.strictEqual(rul.lastIndexOf(obj),2);
  });

  t('get',function(){
    var rul = new Rul(),
        obj = {};

    rul.add(1);
    rul.add(obj);
    assert.strictEqual(rul.get(1),obj);
  });

  t('Symbol.iterator',function*(){
    var rul = new Rul(),
        n = 0,
        v,i;

    assert(!rul.volatile);
    for(i = 0;i < 5;i++) rul.add();
    for(v of rul) n++;
    assert.strictEqual(n,5);

    rul = new Rul(true);
    rul.consume(function(){},function(){},function(){});
    assert(rul.volatile);
    assert(rul.consumable);
    n = 0;

    yield wait(10);
    assert(!rul.consumable);

    for(i = 0;i < 5;i++) rul.add();
    for(v of rul) n++;
    assert.strictEqual(n,0);
  });

  t('append',function(){
    var rul = new Rul(),
        str = '',
        v;

    rul.append([1,2,3,4,5]);
    for(v of rul) str += v;
    assert.strictEqual(str,'12345');

  });

  t('add',function(){
    var rul = new Rul(),
        str = '',
        v;

    rul.add(1);
    for(v of rul.readOnly()) str += v;
    assert.strictEqual(str,'1');

  });

  t('replace',function(){
    var rul = new Rul(),
        str = '',
        v;

    rul.add(1);
    rul.replace(0,2);
    for(v of rul) str += v;
    assert.strictEqual(str,'2');

  });

  t('remove',function(){
    var rul = new Rul(),
        str = '',
        v;

    rul.add(1);
    rul.remove(0);
    for(v of rul) str += v;
    assert.strictEqual(str,'');

    rul = new Rul();
    rul.append([1,2,3]);
    rul.remove(-1);

    str = '';
    for(v of rul) str += v;
    assert.strictEqual(str,'23');

    rul = new Rul();
    rul.append([1,2,3]);
    rul.remove(5);

    str = '';
    for(v of rul) str += v;
    assert.strictEqual(str,'12');

  });

  t('clear',function(){
    var rul = new Rul(),
        str = '',
        v;

    rul.append([0,1,2,3,4,5]);
    rul.clear();
    for(v of rul) str += v;
    assert.strictEqual(str,'');

  });

  t('move',function(){
    var rul = new Rul(),
        str = '',
        v;

    rul.append([1,2,3,4,5]);
    assert.strictEqual(rul.length,5);

    rul.move(1,3);
    for(v of rul) str += v;
    assert.strictEqual(str,'13425');

  });

  t('swap',function(){
    var rul = new Rul(),
        str = '',
        v;

    rul.append([1,2,3,4,5]);
    rul.swap(1,3);
    for(v of rul) str += v;
    assert.strictEqual(str,'14325');

  });

  t('map and consume',function(){
    var rul = new Rul(),
        arr = [],
        v,d,str;

    d = rul.map(n => n + 1).consume(function add(elem,index){
      arr.splice(index,0,elem);
    },function remove(index,num){
      arr.splice(index,num);
    },function move(from,to){
      var e = arr.splice(from,1)[0];
      arr.splice(to,0,e);
    });

    rul.append([1,2,3,4,5]);
    rul.swap(1,3);
    rul.remove(0);
    rul.add(6);

    str = '';
    for(v of rul) str += v + 1;
    assert.strictEqual(str,arr.join(''));

    d.detach();

    rul.append([1,2,3,4,5]);
    rul.swap(1,3);
    rul.remove(0);
    rul.add(6);

    str = '';
    for(v of rul) str += v + 1;
    assert.notStrictEqual(str,arr.join(''));

  });

});
