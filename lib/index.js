'use strict';

import co from 'co';

const INTERNAL = new WeakMap();

/**
 * CoMediator
 */
class CoMediator {

  /**
   * constructor
   */
  constructor () {
    INTERNAL.set(this, {});
    INTERNAL.get(this).subscribers = {};
  }

  /**
   * subscribe
   *
   * @param {String} channel
   * @param {Function} callback
   * @returns {Symbol}
   */
  subscribe (channel, callback) {
    let subscriberSymbol = Symbol();
    INTERNAL.get(this).subscribers[subscriberSymbol] = {
      channel: channel,
      callback: callback
    };
    return subscriberSymbol;
  }

  /**
   * subscribeOnce
   *
   * @param {String} channel
   * @param {Function} callback
   * @returns {Symbol}
   */
  subscribeOnce (channel, callback) {
    console.log('subscribeOnce');
    let sym = this.subscribe(channel, function () {
      this.unSubscribe(sym);
      co.wrap(callback)(arguments);
    }.bind(this));
    return sym;
  }

  /**
   * unSubscribe
   *
   * @param {Symbol} subscriberSymbol
   */
  unSubscribe (subscriberSymbol) {
    if (INTERNAL.get(this).subscribers.hasOwnProperty(subscriberSymbol)) {
      delete INTERNAL.get(this).subscribers[subscriberSymbol];
    } else {
      throw 'no such subscriber symbol';
    }
  }

  /**
   * publish
   *
   * @param {String} channel
   * @param {Mixed} data
   */
  publish (channel, data) {
    let subscribers = INTERNAL.get(this).subscribers;
    Object.getOwnPropertySymbols(subscribers).forEach(function (subscriberSymbol) {
      let subscriber = subscribers[subscriberSymbol];
      if (subscriber.channel === channel) {
        co.wrap(subscriber.callback)(data);
      }
    });
  }
}


let cm = new CoMediator();
cm.testgencallback = function* (data) {
  console.log('callback');
};
cm.testcallback = function (data) {
  console.log('callback');
};

let sym = cm.subscribe('application:chat', cm.testcallback.bind(cm));
cm.publish('application:chat', 'asdf');

export default CoMediator;
