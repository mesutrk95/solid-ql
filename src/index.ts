import * as dotenv from 'dotenv';
dotenv.config();

import Models from './models';
import {IndexerConfig, getIndexerConfig} from './helpers';
import {createProvider} from './helpers/providers';
import {SmartContractEvent, SmartContract} from './SmartContract';
import {EVMNetwork, convertToNetworkEnum} from './blockchain/networks';
import {EventLog, JsonRpcProvider} from 'ethers';
import {hash} from './utils';
import Graph from './graph';

export default class Indexer {
  config: IndexerConfig;
  models: Models;
  providers: Map<EVMNetwork, JsonRpcProvider>;
  watcherSubscriptions: any[];

  constructor(configPath: string) {
    this.config = getIndexerConfig(configPath);
    this.models = new Models(this.config.db);
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
      where: {eventId},
    });
    if (!dbEvent) {
      const record: any = {};
      record.blockNumber = event.blockNumber;
      record.txHash = event.transactionHash;
      record.network = network.toLowerCase();
      record.contract = contract;
      for (const ev of event.values) {
        record[ev.name] = ev.value.toString();
      }
      record.eventId = eventId;
      await this.models.sequelize.models[event.name].create(record);
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
      const provider = this.providers.get(
        convertToNetworkEnum(network)
      ) as JsonRpcProvider;
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
      const provider = this.providers.get(
        convertToNetworkEnum(network)
      ) as JsonRpcProvider;
      const smartContract = new SmartContract(abi, contract, provider);

      for (const ef of smartContract.getEvents()) {
        const sub = smartContract.listenEvents(
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
    graph.start(this.config, this.models);
  }

  async destroy() {
    await this.models.sequelize.close();
    for (const sub of this.watcherSubscriptions) {
      sub.unsubscribe();
    }
  }
}
