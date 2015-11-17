'use strict';

import co from 'co';

const INTERNAL = new WeakMap();

/**
 *
 */
class CoMediator {

  /**
   *
   */
  constructor () {
    INTERNAL.set(this, {});
    INTERNAL.get(this).subscribers = {};
  }

  /**
   *
   * @param channel
   * @param callback
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
   *
   * @param channel
   * @param callback
   */
  subscribeOnce (channel, callback) {
    console.log(channel);
  }

  /**
   *
   * @param subscriberSymbol
   */
  unSubscribe (subscriberSymbol) {
    if (INTERNAL.get(this).subscribers.hasOwnProperty(subscriberSymbol)) {
      delete INTERNAL.get(this).subscribers[subscriberSymbol];
    } else {
      throw 'no such subscriber symbol';
    }
  }

  /**
   *
   * @param channel
   * @param data
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
let sym = cm.subscribe('application:chat', function* (data){
  console.log('data is : ' + data);
});

cm.publish('application:chat', 'asdf123');
cm.unSubscribe(sym);
cm.publish('application:chat', 'asdf');
cm.unSubscribe(sym);


export default CoMediator;
