import co from 'co';
import Mediator from './mediator';

class CoMediator {

  /**
   * constructor
   */
  constructor(mediator) {
    Object.defineProperty(this, 'mediator', {
      enumerable: false,
      configurable: false,
      writable: false,
      value: mediator || new Mediator()
    });
    this.unsubscribe = this.mediator.unsubscribe.bind(this.mediator);
    this.publish = this.mediator.publish.bind(this.mediator);
    this.unpublish = this.mediator.unpublish.bind(this.mediator);
    this.publishOnce = this.mediator.publishOnce.bind(this.mediator);
    this.unregisterProcedure = this.mediator.unregisterProcedure.bind(this.mediator);
  }

  subscribe(channel, callback) {
    return this.mediator.subscribe(channel, co.wrap(callback));
  }

  subscribeOnce(channel, callback) {
    return this.mediator.subscribeOnce(channel, co.wrap(callback));
  }

  procedure(channel, ...param) {
    return new Promise(resolve => {
      param.push(resolve);
      this.mediator.procedure(channel, ...param);
    });
  }

  registerProcedure(channel, procedure) {
    return this.mediator.registerProcedure(channel, co.wrap(procedure));
  }
}

export default CoMediator;
export {Mediator};
