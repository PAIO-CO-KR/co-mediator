import assert from 'assert';
import CoMediator from '../lib/index';

describe('co-mediator', function () {

  it('thrown error on subscribed callback function', function (done) {
    let cm = new CoMediator();
    let error = 'an error';
    cm.subscribe('test', function* () {
      throw error;
    }, function (e) {
      assert(e === error, 'must be caught.');
      done();
    });
    cm.publish('test');
  });

  it('thrown error on subscribed once callback function', function (done) {
    let cm = new CoMediator();
    let error = 'an error';
    cm.subscribeOnce('test', function* () {
      throw error;
    }, function (e) {
      assert(e === error, 'must be caught.');
      done();
    });
    cm.publish('test');
  });

  it('subscribed callback function', function (done) {
    let cm = new CoMediator();
    let testData = 'a string';
    cm.subscribe('test', function (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      done();
    }, function (e) {
      done(e);
    });
    cm.publish('test', testData);
  });

  it('subscribed generator callback function', function (done) {
    let cm = new CoMediator();
    let testData = 'a string';
    cm.subscribe('test', function* (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      done();
    }, function (e) {
      done(e);
    });
    cm.publish('test', testData);
  });

  it('subscribed once callback function', function (done) {
    let cm = new CoMediator();
    let testData = 'a string';
    cm.subscribeOnce('test', function (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      done();
    }, function (e) {
      done(e);
    });
    cm.publish('test', testData);
  });

  it('subscribed once generator callback function', function (done) {
    let cm = new CoMediator();
    let testData1 = 'a string 1';
    let testData2 = 'a string 2';
    cm.subscribeOnce('test', function* (publishedData1, publishedData2) {
      assert(testData1 === publishedData1, 'should be called with passed data');
      assert(testData2 === publishedData2, 'should be called with passed data');
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      done();
    }, function (e) {
      done(e);
    });
    cm.publish('test', testData1, testData2);
  });

  it('subscribed callback function shouldn\'t be called after unsubscribe', function (done) {
    let cm = new CoMediator();
    let testData = 'a string';
    let subscriberSymbol = cm.subscribe('test', function* () {
      done('callback can not be called');
    });
    cm.unsubscribe(subscriberSymbol);
    cm.publish('test', testData);

    let cb = function* () {
      done('callback can not be called');
    };
    cm.subscribe('test2', cb);
    cm.unsubscribe(cb);
    cm.publish('test2', testData);

    setTimeout(function () {
      done();
    }, 10);
  });

  it('procedure should be registered/called with param and returns result', function (done) {
    let cm = new CoMediator();
    cm.subscribeProcedure('ch', function* () {
      return yield Promise.resolve('wrong result');
    });
    cm.subscribeProcedure('ch', function* (param) {
      assert(param === 'param', 'should be called with param');
      return yield Promise.resolve('result');
    });

    cm.procedure('ch', 'param')
      .then(function (val) {
        assert(val === 'result', 'should return result');
        cm.procedure('wrong ch')
          .then(function () {
            done('should not be called with wrong ch');
          })
          .catch(function (e) {
            assert(e === 'no procedure found', 'should throw error');
            cm.procedureCb('ch', function (val2) {
              assert(val2 === 'result', 'should return result');
              done();
            }, function (e2) {
              done('proper call should not be fell in with exeption' + e2);
            }, 'param');
          });
      })
      .catch(function (e) {
        done(e);
      });
  });

});
