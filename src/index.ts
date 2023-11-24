import * as dotenv from 'dotenv';
dotenv.config();

import Models from './models';
import {IndexerConfig, getIndexerConfig} from './helpers';
import {createProvider} from './helpers/providers';
import {SmartContract} from './SmartContract';
import {EVMNetwork, convertToNetworkEnum} from './blockchain/networks';
import {EventLog, JsonRpcProvider} from 'ethers';
import {hash} from './utils';

export default class Indexer {
  config: IndexerConfig;
  models: Models;
  providers: Map<EVMNetwork, JsonRpcProvider>;

  constructor(configPath: string) {
    this.config = getIndexerConfig(configPath);
    this.models = new Models(this.config.db);
    this.providers = new Map();
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
          const record: any = {};
          record.blockNumber = event.blockNumber;
          record.txHash = event.transactionHash;
          record.network = network.toLowerCase();
          for (const ev of event.values) {
            record[ev.name] = ev.value.toString();
          }
          const eventId = hash(event.transactionHash);
          record.eventId = eventId;
          await this.models.sequelize.models[ef.name].create(record);
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
        const sub = smartContract.listenEvents(ef.name, (values: EventLog) => {
          if (values.blockNumber < startBlock) return;
          console.log('new eveeeeeeeeeeeeeeeeeeeeeeent', ef.name, values);
        });
      }
      // sub.unsubscribe();
    }
  }
}
