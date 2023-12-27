import {readFileSync} from 'fs';
import {EVMNetwork} from './blockchain/types';

export type ProviderType = 'alchemy' | 'infura' | 'json-rpc';

interface AlchemyProvider {
  type: 'alchemy';
  key: string;
}
interface InfuraProvider {
  type: 'infura';
  key: string;
}

interface JsonRpcProvider {
  type: 'json-rpc';
  rpcUrl: string;
}

type Provider = AlchemyProvider | InfuraProvider | JsonRpcProvider;

interface Providers {
  ethereum: Provider;
  sepolia: Provider;
  bsc_test: Provider;
}

interface IndexerConfigEntity {
  abi: string;
  network: EVMNetwork;
  contract: string;
  startBlock: number;
}

interface IndexerStoreConfig {
  url: string;
  solidQlColumnsPrefix: string;
}
interface GraphQLConfig {
  port: number;
}

export interface IndexerConfig {
  contracts: IndexerConfigEntity[];
  providers: Providers;
  store: IndexerStoreConfig;
  graph: GraphQLConfig;
  getAllNetworks: () => EVMNetwork[];
}

export default class AppConfig implements IndexerConfig {
  private static instance: AppConfig;
  contracts: IndexerConfigEntity[] = [];
  providers: Providers = {} as Providers;
  store: IndexerStoreConfig = {} as IndexerStoreConfig;
  graph: GraphQLConfig = {} as GraphQLConfig;

  public static getInstance(): AppConfig {
    if (!AppConfig.instance) {
      AppConfig.instance = new AppConfig();
    }
    return AppConfig.instance;
  }

  public getAllNetworks(): EVMNetwork[] {
    const providers = new Set<EVMNetwork>();
    this.contracts.forEach(contract => {
      providers.add(contract.network as EVMNetwork);
    });
    return Array.from(providers);
  }

  public static load(configFile: string) {
    const content = readFileSync(configFile, 'utf-8');
    const obj = JSON.parse(content) as IndexerConfig;
    const config = this.getInstance();
    config.contracts = obj.contracts;
    config.providers = obj.providers;
    config.store = obj.store;
    config.graph = obj.graph;
    config.store.solidQlColumnsPrefix =
      typeof obj.store.solidQlColumnsPrefix === 'undefined'
        ? 'indexer'
        : obj.store.solidQlColumnsPrefix;
  }
}
