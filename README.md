# co-mediator [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> A mediator with [co](https://github.com/tj/co) wrapped subscriber.

## Install

```sh
$ npm install --save co-mediator
```


## Usage

```js
let CoMediator = require('co-mediator');
let cm = new CoMediator();
let testData1 = 'a string 1';
let testData2 = 'a string 2';

//a normal subscriber.
let subscriberSymbol1 = cm.subscribe('test', function (publishedData1, publishedData2) {
  console.log(publishedData1 + ' and ' + publishedData2);
});

//a generator subscriber. it will be co wrapped.
let subscriberSymbol2 = cm.subscribe('test', function* (publishedData1, publishedData2) {
  console.log(publishedData1 + ' and ' + publishedData2);
  yield Promise.resolve(true);
});

//error handler
let subscriberSymbol3 = cm.subscribe('test', function* (publishedData1, publishedData2) {
  throw 'an error from the subscriber';
}, function (e) {
  console.log('thrown error ' + e);
});

//publish. specipying channel & arguments. you can pass 0 or more arguments
cm.publish('test');
cm.publish('test', testData1);
cm.publish('test', testData1, testData2);

//unsubscribe
cm.unsubscribe(subscriberSymbol1);
cm.unsubscribe(subscriberSymbol2);
cm.unsubscribe(subscriberSymbol3);
cm.publish('test', testData1, testData2);

//subscribe once
let subscriberSymbol3 = cm.subscribeOnce('test', function* (publishedData1, publishedData2) {
  console.log('this code will be called one time');
}, function (e) {
  console.log('thrown error ' + e);
});
cm.publish('test', testData1, testData2);

//subscribe procedure
cm.subscribeProcedure('ch', function* (param) {
  console.log('passed param is ' + param);
  return yield Promise.resolve('result');
});

//call procedure
cm.procedure('ch', 'param')
  .then(function (val) {
    console.log('result is ' + val);
  })
  .catch(function (e) {
    console.log('this line prints if called proc throws error');
  });
```

## License

MIT © [PAIO co.,ltd.](http://www.paio.co.kr)


[npm-image]: https://badge.fury.io/js/co-mediator.svg
[npm-url]: https://npmjs.org/package/co-mediator
[travis-image]: https://travis-ci.org/PAIO-CO-KR/co-mediator.svg?branch=master
[travis-url]: https://travis-ci.org/PAIO-CO-KR/co-mediator
[daviddm-image]: https://david-dm.org/PAIO-CO-KR/co-mediator.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/PAIO-CO-KR/co-mediator
[coveralls-image]: https://coveralls.io/repos/PAIO-CO-KR/co-mediator/badge.svg
[coveralls-url]: https://coveralls.io/r/PAIO-CO-KR/co-mediator
