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
