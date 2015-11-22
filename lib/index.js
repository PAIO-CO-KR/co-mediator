import co from 'co';

const INTERNAL = new WeakMap();

/**
 * CoMediator
 */
class CoMediator {

  /**
   * constructor
   */
  constructor() {
    INTERNAL.set(this, {});
    INTERNAL.get(this).subscribers = {};
  }

  /**
   * subscribe
   *
   * @param {String} channel
   * @param {Function} callback
   * @param {Function=} errorCallback
   * @returns {Symbol}
   */
  subscribe(channel, callback, errorCallback) {
    let subscriberSymbol = Symbol();
    INTERNAL.get(this).subscribers[subscriberSymbol] = {
      channel: channel,
      callback: callback,
      errorCallback: errorCallback
    };
    return subscriberSymbol;
  }

  /**
   * subscribeOnce
   *
   * @param {String} channel
   * @param {Function} callback
   * @param {Function=} errorCallback
   * @returns {Symbol}
   */
  subscribeOnce(channel, callback, errorCallback) {
    let sym = this.subscribe(channel, function (...data) {
      this.unsubscribe(sym);
      co.wrap(callback)(...data).catch(errorCallback);
    }.bind(this));
    return sym;
  }

  /**
   * unsubscribe
   *
   * @param {Symbol} subscriberSymbol
   */
  unsubscribe(subscriberSymbol) {
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
   * @param {*=} data
   */
  publish(channel, ...data) {
    let subscribers = INTERNAL.get(this).subscribers;
    Object.getOwnPropertySymbols(subscribers).forEach(function (subscriberSymbol) {
      let subscriber = subscribers[subscriberSymbol];
      if (subscriber.channel === channel) {
        co.wrap(subscriber.callback)(...data).catch(subscriber.errorCallback);
      }
    });
  }
}

export default CoMediator;
