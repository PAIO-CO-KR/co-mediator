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
    let testData = 'a string';
    cm.subscribeOnce('test', function* (publishedData) {
      assert(testData === publishedData, 'should be called with passed data');
      let a = yield Promise.resolve(1);
      assert(a === 1, 'should be called as co-generator-function');
      done();
    }, function (e) {
      done(e);
    });
    cm.publish('test', testData);
  });
});
