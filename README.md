# Remotely Updated List [![Build Status][ci-img]][ci-url] [![Coverage Status][cover-img]][cover-url]

`Rul` provides an abstraction layer above any list-like object, making it possible to control several different lists with a single unified interface. This can be achieved by consuming a `rul`:

```javascript
var Rul = require('rul'),
    rul = new Rul();

// ...

rul.consume(
  function onAdd(elem,index){ /***/ },
  function onRemove(index,ammount){ /***/ },
  function onMove(lowerIndex,higherIndex){ /***/ }
);
```

What follows is an example of modifying a `rul`:

```javascript
rul.add(0);
rul.clear();
rul.append([1,2,3,4,5,6,7]);
rul.add(4);
rul.replace(rul.length - 1,3);
rul.remove(1,2);
rul.move(2,4);
rul.swap(1,3);

// final state:
// [1, 7, 6, 4, 5, 3]
```

Above methods are available on any `Rul` instance. Some accessor methods are available too:

```javascript
rul.indexOf(elem);
rul.lastIndexOf(elem);
rul.get(index);

for(value of rul){
  //...
}
```

These methods will only work on *consumable* `rul`s. A `rul` can become *non-consumable* if it was initialized as *volatile* (`true` as the only argument of the constructor) and has recently been consumed. Volatile `rul`s exist purely for the sake of memory management: when they become *non-consumable* they behave as sinks of data, it's up to the consumers to decide what to do with it, but the `rul` itself won't retain said data.

[ci-img]: https://circleci.com/gh/manvalls/rul.svg?style=shield
[ci-url]: https://circleci.com/gh/manvalls/rul
[cover-img]: https://coveralls.io/repos/manvalls/rul/badge.svg?branch=master&service=github
[cover-url]: https://coveralls.io/github/manvalls/rul?branch=master
