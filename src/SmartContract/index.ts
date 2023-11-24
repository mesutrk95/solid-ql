import {
  Contract,
  EventFragment,
  EventLog,
  JsonRpcProvider,
  Listener,
  ethers,
} from 'ethers';
import {loadContractInterface} from './utils';

export class SmartContract {
  contract: Contract;

  constructor(
    path: string,
    contractAddress: string,
    provider: JsonRpcProvider
  ) {
    this.contract = new ethers.Contract(
      contractAddress,
      loadContractInterface(path),
      provider
    );
  }

  public getEvents() {
    const events: EventFragment[] = [];
    this.contract.interface.forEachEvent(event => events.push(event));
    return events;
  }

  async getBlockEvents(
    eventName: string,
    formBlockNumber: number,
    toBlockNumber: number
  ) {
    const contractEvent = this.contract.getEvent(eventName);
    const filter = this.contract.filters[eventName];
    const logs = await this.contract.queryFilter(
      filter,
      formBlockNumber,
      toBlockNumber
    );
    const events = logs.filter(
      log => (log as EventLog)?.fragment?.type === 'event'
    ) as EventLog[];

    return events.map(event => ({
      values: event.args.map((arg, index) => ({
        value: arg,
        name: contractEvent.fragment.inputs[index].name,
        type: contractEvent.fragment.inputs[index].type,
      })),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
    }));
  }

  listenEvents(eventName: string, callback: Listener) {
    this.contract.on(eventName, callback);

    return {
      unsubscribe: () => this.contract.removeListener(eventName, callback),
    };
  }
}
