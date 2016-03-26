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
    INTERNAL.get(this).statuses = {};
  }

  /**
   * subscribe
   *
   * @param {String|Object} channel
   * @param {Function} callback
   * @param {Function=} errorCallback
   * @returns {Symbol}
   */
  subscribe(channel, callback, errorCallback) {
    let subscriberSymbol = Symbol();
    let tag = null;
    let ch = null;
    if (typeof channel === 'object') {
      tag = channel.tag;
      ch = channel.ch;
    } else {
      ch = channel;
    }

    INTERNAL.get(this).subscribers[subscriberSymbol] = {
      channel: ch,
      callback: callback,
      errorCallback: errorCallback,
      tag: tag
    };
    if (INTERNAL.get(this).statuses[channel]) {
      co.wrap(callback)(...(INTERNAL.get(this).statuses[channel])).catch(errorCallback);
    }
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
      let funcOrTag = subscriberSymbol;
      let subscribers = INTERNAL.get(this).subscribers;
      Object.getOwnPropertySymbols(subscribers).forEach(function (subscriberSymbol2) {
        let subscriber = subscribers[subscriberSymbol2];
        if (subscriber.callback === funcOrTag || subscriber.tag === funcOrTag) {
          delete INTERNAL.get(this).subscribers[subscriberSymbol2];
        }
        return;
      }.bind(this));
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
   * publish status
   *
   * @param channel
   * @param status
   */
  publishStatus(channel, ...status) {
    INTERNAL.get(this).statuses[channel] = status;
    this.publish(channel, ...status);
  }

  /**
   * delete status
   *
   * @param channel
   */
  unpublishStatus(channel) {
    delete INTERNAL.get(this).statuses[channel];
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


  /***
   * procedure call with callback
   *
   * @param channel
   * @param resolveCallback
   * @param rejectCallback
   * @param data
   */
  procedureCb(channel, resolveCallback, rejectCallback, ...data) {
    this.procedure(channel, ...data).then(resolveCallback).catch(rejectCallback);
  }

  /**
   * subscribe procedure
   *
   * @param {String|Object} channel
   * @param callback
   * @returns {Symbol}
   */
  subscribeProcedure(channel, callback) {
    let subscriberSymbol = Symbol();
    let ch = null;
    let tag = null;
    if (typeof channel === 'object') {
      ch = channel.ch;
      tag = channel.tag;
    } else {
      ch = channel;
    }

    this.unsubscribeProcedure(channel);
    INTERNAL.get(this).procedureSubscribers[subscriberSymbol] = {
      channel: ch,
      callback: callback,
      tag: tag
    };
    return subscriberSymbol;
  }

  /**
   * un-subscribe procedure
   *
   * @param channelOrTag
   */
  unsubscribeProcedure(channelOrTag) {
    let procedureSubscribers = INTERNAL.get(this).procedureSubscribers;
    let symbols = Object.getOwnPropertySymbols(procedureSubscribers);
    for (let i = 0; i < symbols.length; i += 1) {
      let subscriber = procedureSubscribers[symbols[i]];
      if (subscriber.channel === channelOrTag || subscriber.tag === channelOrTag) {
        delete procedureSubscribers[symbols[i]];
        return;
      }
    }
  }
}

export default CoMediator;
