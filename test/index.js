import assert from 'assert';
import CoMediator from '../lib/index';

describe('mediator', function () {
  it('subscribed callback function should be called', function (done) {
    let m = new CoMediator().mediator;
    let testData = 'a string';
    m.subscribe('test', function (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      done();
    });
    m.publish('test', testData);
  });

  it('subscribed once callback function should be called', function (done) {
    let m = new CoMediator().mediator;
    let testData = 'a string';
    m.subscribeOnce('test', function (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      done();
    });
    m.publish('test', testData);
  });

  it('subscribed callback function shouldn\'t be called after unsubscribe', function (done) {
    let m = new CoMediator().mediator;
    let testData = 'a string';
    let subscriberId = m.subscribe('test', function () {
      done('callback can not be called');
    });
    m.unsubscribe(subscriberId);
    m.publishOnce('test', testData);

    setTimeout(function () {
      done();
    }, 10);
  });

  it('procedure should be registered/called with param and returns result', function (done) {
    let m = new CoMediator().mediator;
    m.registerProcedure('ch', function (param, callback) {
      assert(param === 'param', 'should be called with param');
      callback('result');
    });

    m.procedure('ch', 'param', function (result) {
      assert(result === 'result', 'should return result');
      m.unregisterProcedure('ch');
      m.procedure('ch', 'param', function () {
        done('unregistered procedure should not be called');
      });
      setTimeout(function () {
        done();
      }, 10);
    });
  });

  it('subscribed and subscribing callbacks should be called when publishing status', function (done) {
    let m = new CoMediator().mediator;
    let testData = 'a string 1';
    let subCalled = false;
    let subOnceCalled = false;
    let subStatusCalled = false;
    m.subscribe('test', function (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      subCalled = true;
    });
    m.subscribeOnce('test', function (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      subOnceCalled = true;
    });
    m.publish('test', testData);
    m.subscribe('test', function (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      subStatusCalled = true;
    });
    setTimeout(function () {
      assert(subCalled === true, 'subscribed should be called with passed data');
      assert(subOnceCalled === true, 'subscribed once should be called with passed data');
      assert(subStatusCalled === true, 'delayed subscribed should be called with passed data');

      m.unpublish('test');
      m.subscribe('test', function () {
        done('should not be called after unpublishStatus');
      });
      setTimeout(function () {
        done();
      }, 10);
    }, 10);
  });
});


describe('co-mediator', function () {
  it('subscribed callback function should be called', function (done) {
    let cm = new CoMediator();
    let testData = 'a string';
    cm.subscribe('test', function* (publishedData) {
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      assert(testData === publishedData, 'should be called with passed data');
      done();
    });
    cm.publish('test', testData);
  });

  it('subscribed once callback function should be called', function (done) {
    let cm = new CoMediator();
    let testData = 'a string';
    cm.subscribeOnce('test', function* (publishedData) {
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      assert(testData === publishedData, 'should be called with passed data');
      done();
    });
    cm.publish('test', testData);
  });

  it('subscribed callback function shouldn\'t be called after unsubscribe', function (done) {
    let cm = new CoMediator();
    let testData = 'a string';
    let subscriberId = cm.subscribe('test', function* () {
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      done('callback can not be called');
    });
    cm.unsubscribe(subscriberId);
    cm.publishOnce('test', testData);

    setTimeout(function () {
      done();
    }, 10);
  });

  it('procedure should be registered/called with param and returns result', function (done) {
    let cm = new CoMediator();
    cm.registerProcedure('ch', function* (param, callback) {
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      assert(param === 'param', 'should be called with param');
      callback('result');
    });

    cm.procedure('ch', 'param').then(function (result) {
      assert(result === 'result', 'should return result');
      cm.procedure('ch', 'param', function () {
      }).then(function () {
        done('unregistered procedure should not be called');
      });
      setTimeout(function () {
        done();
      }, 10);
    });
  });

  it('subscribed and subscribing callbacks should be called when publishing status', function (done) {
    let cm = new CoMediator();
    let testData = 'a string 1';
    let subCalled = false;
    let subOnceCalled = false;
    let subStatusCalled = false;
    cm.subscribe('test', function* (publishedData) {
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      assert(testData === publishedData, 'should be called with passed data');
      subCalled = true;
    });
    cm.subscribeOnce('test', function* (publishedData) {
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      assert(testData === publishedData, 'should be called with passed data');
      subOnceCalled = true;
    });
    cm.publish('test', testData);
    cm.subscribe('test', function* (publishedData) {
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      assert(testData === publishedData, 'should be called with passed data');
      subStatusCalled = true;
    });
    setTimeout(function () {
      assert(subCalled === true, 'subscribed should be called with passed data');
      assert(subOnceCalled === true, 'subscribed once should be called with passed data');
      assert(subStatusCalled === true, 'delayed subscribed should be called with passed data');

      cm.unpublish('test');
      cm.subscribe('test', function* () {
        let a = yield Promise.resolve(1);
        assert(a === 1, 'should be called as co-generator-function');
        done('should not be called after unpublishStatus');
      });
      setTimeout(function () {
        done();
      }, 10);
    }, 10);
  });

});
