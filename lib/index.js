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
    INTERNAL.get(this).procedureSubscribers = {};
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
   * @param {Symbol|Function} subscriberSymbol
   */
  unsubscribe(subscriberSymbol) {
    if (INTERNAL.get(this).subscribers.hasOwnProperty(subscriberSymbol)) {
      delete INTERNAL.get(this).subscribers[subscriberSymbol];
    } else {
      let func = subscriberSymbol;
      let subscribers = INTERNAL.get(this).subscribers;
      for (let sym of Object.getOwnPropertySymbols(subscribers)) {
        let subscriber = subscribers[sym];
        if (subscriber.callback === func) {
          delete INTERNAL.get(this).subscribers[sym];
        }
        return;
      }
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

  /**
   * procedure call
   *
   * @param channel
   * @param data
   * @returns {Promise}
   */
  procedure(channel, ...data) {
    let procedureSubscribers = INTERNAL.get(this).procedureSubscribers;
    let symbols = Object.getOwnPropertySymbols(procedureSubscribers);
    for (let i = 0; i < symbols.length; i += 1) {
      let procedureSubscriber = procedureSubscribers[symbols[i]];
      if (procedureSubscriber.channel === channel) {
        return co.wrap(procedureSubscriber.callback)(...data);
      }
    }

    return new Promise(function (resolve, reject) {
      setImmediate(function () {
        reject('no procedure found');
      });
    });
  }

  /**
   * subscribe procedure
   *
   * @param channel
   * @param callback
   * @returns {Symbol}
   */
  subscribeProcedure(channel, callback) {
    let procedureSubscribers = INTERNAL.get(this).procedureSubscribers;
    Object.getOwnPropertySymbols(procedureSubscribers).forEach(function (subscriberSymbol) {
      let procedureSubscriber = procedureSubscribers[subscriberSymbol];
      if (procedureSubscriber.channel === channel) {
        delete procedureSubscribers[subscriberSymbol];
      }
    });
    let subscriberSymbol = Symbol();
    INTERNAL.get(this).procedureSubscribers[subscriberSymbol] = {
      channel: channel,
      callback: callback
    };
    return subscriberSymbol;
  }
}

export default CoMediator;
