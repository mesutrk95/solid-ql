import {
  Contract,
  EventLog,
  Interface,
  JsonRpcProvider,
  Listener,
  ethers,
} from 'ethers';
import {readFileSync} from 'fs';
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
    this.contract.interface.forEachEvent(event => console.log(event));
  }

  async getBlockEvents(
    eventName: string,
    blockNumber: number
  ): Promise<{name: string; value: any; type: string}[][]> {
    const contractEvent = this.contract.getEvent(eventName);
    const filter = this.contract.filters[eventName];
    const logs = await this.contract.queryFilter(
      filter,
      blockNumber,
      blockNumber
    );
    const events = logs.filter(
      log => (log as EventLog)?.fragment?.type === 'event'
    ) as EventLog[];

    return events.map(event =>
      event.args.map((arg, index) => ({
        value: arg,
        name: contractEvent.fragment.inputs[index].name,
        type: contractEvent.fragment.inputs[index].type,
      }))
    );
  }

  listenEvents(eventName: string, callback: Listener) {
    this.contract.on(eventName, callback);

    return {
      unsubscribe: () => this.contract.removeListener(eventName, callback),
    };
  }
}
