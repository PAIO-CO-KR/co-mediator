const INTERNAL = new WeakMap();

function makeUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = Math.random() * 16 | 0;
    let v = c === 'x' ? r : r & 0x3 | 0x8;
    return v.toString(16);
  });
}

class Mediator {

  /**
   * constructor
   */
  constructor() {
    INTERNAL.set(this, {});
    INTERNAL.get(this).channels = {
      //status
      //channels
      //procedure
    };
  }

  /**
   * get channel
   * @param channel
   * @returns {*|{subscribers: {}}}
   * @private
   */
  _getChannel(channel) {
    let channelObj = INTERNAL.get(this).channels[channel] = INTERNAL.get(this).channels[channel] || {
      //procedure
      //status
      subscribers: {}
    };
    return channelObj;
  }

  /**
   * subscribe
   *
   * @param {String} channel
   * @param {Function} callback
   * @returns {String} subscriberId
   */
  subscribe(channel, callback) {
    let uuid = `${channel}:${makeUuid()}`;
    let channelObj = this._getChannel(channel);
    channelObj.subscribers[uuid] = {
      channel: channel,
      callback: callback
    };
    if (channelObj.hasOwnProperty('status')) {
      setImmediate(() => callback(...channelObj.status));
    }
    return uuid;
  }

  /**
   * subscribeOnce
   *
   * @param {String} channel
   * @param {Function} callback
   * @returns {String} subscriberId
   */
  subscribeOnce(channel, callback) {
    let uuid = this.subscribe(channel, function (...data) {
      this.unsubscribe(uuid);
      callback(...data);
    }.bind(this));
    return uuid;
  }

  /**
   * unsubscribe
   *
   * @param {String} subscriberId
   */
  unsubscribe(subscriberId) {
    let channel = subscriberId.substring(0, subscriberId.lastIndexOf(':'));
    let channelObj = this._getChannel(channel);
    if (channelObj.subscribers.hasOwnProperty(subscriberId)) {
      delete channelObj.subscribers[subscriberId];
    }
  }

  /**
   * publish
   *
   * @param {String} channel
   * @param {...*} data
   */
  publish(channel, ...data) {
    this._getChannel(channel).status = data;
    this.publishOnce(channel, ...data);
  }

  /**
   * unpublish
   * @param {String} channel
   */
  unpublish(channel) {
    delete this._getChannel(channel).status;
  }

  /**
   * publish once
   * @param {String} channel
   * @param {...*} data
   */
  publishOnce(channel, ...data) {
    let channelObj = this._getChannel(channel);
    Object.keys(channelObj.subscribers).forEach(key => {
      setImmediate(() => channelObj.subscribers[key].callback(...data));
    });
  }

  /**
   * procedure call
   *
   * @param {String} channel
   * @param (...*) param ...data, callback
   * @returns {Promise}
   */
  procedure(channel, ...param) {
    let channelObj = this._getChannel(channel);
    if (channelObj.hasOwnProperty('procedure')) {
      setImmediate(() => channelObj.procedure(...param));
    }
  }

  /**
   * register procedure
   * @param {String} channel
   * @param {Function} procedure
   */
  registerProcedure(channel, procedure) {
    this._getChannel(channel).procedure = procedure;
  }

  /**
   * unregister procedure
   * @param {String} channel
   */
  unregisterProcedure(channel) {
    delete this._getChannel(channel).procedure;
  }
}

let k = 0;

export default Mediator;
export {k};
