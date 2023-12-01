import {
  Contract,
  ContractEventPayload,
  EventFragment,
  EventLog,
  JsonRpcProvider,
  Listener,
  ethers,
} from 'ethers';
import {loadContractInterface} from './utils';

export interface ListenEventSubscription {
  unsubscribe: () => {};
}
export interface SmartContractEvent {
  values: {
    value: string | number | boolean;
    name: string;
    type: string;
  }[];
  blockNumber: number;
  transactionHash: string;
  name: string;
}

export class SmartContract {
  contract: Contract;

  constructor(
    path: string,
    contractAddress: string,
    provider: JsonRpcProvider | undefined
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

  parseEventLog(event: EventLog): SmartContractEvent {
    const contractEvent = this.contract.getEvent(event.eventName);
    return {
      values: event.args.map((arg, index) => ({
        value: arg,
        name: contractEvent.fragment.inputs[index].name,
        type: contractEvent.fragment.inputs[index].type,
      })),
      blockNumber: event.blockNumber,
      transactionHash: event.transactionHash,
      name: event.eventName,
    };
  }

  async getBlockEvents(
    eventName: string,
    formBlockNumber: number,
    toBlockNumber: number
  ): Promise<SmartContractEvent[]> {
    const filter = this.contract.filters[eventName];
    const logs = await this.contract.queryFilter(
      filter,
      formBlockNumber,
      toBlockNumber
    );
    const events = logs.filter(
      log => (log as EventLog)?.fragment?.type === 'event'
    ) as EventLog[];

    return events.map(event => this.parseEventLog(event));
  }

  listenEvent(eventName: string, callback: Listener): ListenEventSubscription {
    this.contract.on(eventName, (...args: (ContractEventPayload | any)[]) => {
      const payload = args.find(
        arg => typeof arg === 'object'
      ) as ContractEventPayload;
      callback(this.parseEventLog(payload.log));
    });

    return {
      unsubscribe: () => this.contract.removeListener(eventName, callback),
    };
  }
}
