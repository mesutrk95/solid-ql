import * as dotenv from 'dotenv';
dotenv.config();

import {JsonRpcProvider} from 'ethers';
import {createProvider} from './blockchain/providers';
import {
  SmartContractEvent,
  SmartContract,
  ListenEventSubscription,
} from './SmartContract';
import {EVMNetwork} from './blockchain/networks';
import {hash} from './utils';
import Graph from './graph';
import AppConfig from './config';
import Models, {getColumnName} from './models';

interface EventStoreRecord {
  [key: string]: string | number;
}

export default class Indexer {
  models: Models;
  providers: Map<EVMNetwork, JsonRpcProvider>;
  watcherSubscriptions: ListenEventSubscription[];
  config: AppConfig;

  constructor(configPath: string) {
    AppConfig.load(configPath);
    this.config = AppConfig.getInstance();

    this.models = new Models();
    this.providers = new Map();
    this.watcherSubscriptions = [];
  }

  async prepare() {
    await this.models.connect();
    for (const contract of this.config.contracts) {
      await this.models.generateAllDatabaseModels(contract.abi);
    }
    this.config.getAllNetworks().forEach(pk => {
      const provider = createProvider(pk);
      if (!provider) throw new Error(`Provider not found ${pk}`);
      this.providers.set(pk, provider);
    });
  }

  async sync(force = false) {
    await this.models.sync(force);
  }

  async storeEventToDatabase(
    event: SmartContractEvent,
    network: string,
    contract: string
  ) {
    const eventId = hash(event.transactionHash);
    const eventSchema = this.models.sequelize.models[event.name];
    const dbEvent = await eventSchema.findOne({
      where: {[getColumnName('eventId')]: eventId},
    });
    if (!dbEvent) {
      const record: EventStoreRecord = {};
      record[getColumnName('eventId')] = eventId;
      record[getColumnName('blockNumber')] = event.blockNumber;
      record[getColumnName('txHash')] = event.transactionHash;
      record[getColumnName('network')] = network.toLowerCase();
      record[getColumnName('contract')] = contract;
      for (const ev of event.values) {
        record[ev.name] = ev.value.toString();
      }
      await this.models.sequelize.models[event.name].create(record as any);
      console.log(`stored event ${event.name}, eventId: ${eventId}`);
    } else {
      console.log(
        `skipped event ${event.name}, eventId: ${eventId} already exists`
      );
    }
  }

  async processOldEvents() {
    for (const entity of this.config.contracts) {
      const {abi, contract, network, startBlock} = entity;
      const provider = this.providers.get(network) as JsonRpcProvider;
      const currentBlock = await provider.getBlockNumber();
      const smartContract = new SmartContract(abi, contract, provider);

      const eventFragments = smartContract.getEvents();
      for (const ef of eventFragments) {
        const events = await smartContract.getBlockEvents(
          ef.name,
          startBlock,
          currentBlock
        );

        for (const event of events) {
          await this.storeEventToDatabase(event, network, contract);
        }
      }
    }
  }

  async watch() {
    for (const entity of this.config.contracts) {
      const {abi, contract, network, startBlock} = entity;
      const provider = this.providers.get(network) as JsonRpcProvider;
      const smartContract = new SmartContract(abi, contract, provider);

      for (const ef of smartContract.getEvents()) {
        const sub = smartContract.listenEvent(
          ef.name,
          (event: SmartContractEvent) => {
            if (event.blockNumber < startBlock) return;
            this.storeEventToDatabase(event, network, contract);
          }
        );
        this.watcherSubscriptions.push(sub);
      }
    }
  }

  async startGraph() {
    const graph = new Graph();
    graph.start(this.models);
  }

  async destroy() {
    await this.models.sequelize.close();
    for (const sub of this.watcherSubscriptions) {
      sub.unsubscribe();
    }
  }
}
