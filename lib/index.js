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
   * @returns {Symbol}
   */
  subscribeOnce(channel, callback, errorCallback) {
    let sym = this.subscribe(channel, function (data) {
      this.unSubscribe(sym);
      co.wrap(callback)(data).catch(function (e) {
        errorCallback(e);
      });
    }.bind(this));
    return sym;
  }

  /**
   * unSubscribe
   *
   * @param {Symbol} subscriberSymbol
   */
  unSubscribe(subscriberSymbol) {
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
  publish(channel, data) {
    let subscribers = INTERNAL.get(this).subscribers;
    Object.getOwnPropertySymbols(subscribers).forEach(function (subscriberSymbol) {
      let subscriber = subscribers[subscriberSymbol];
      if (subscriber.channel === channel) {
        co.wrap(subscriber.callback)(data).catch(function (e) {
          subscriber.errorCallback(e);
        });
      }
    });
  }
}

export default CoMediator;
