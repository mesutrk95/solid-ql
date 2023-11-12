import {readFileSync} from 'fs';
import {EVMNetwork, convertToNetworkEnum} from '../blockchain/networks';

interface IndexerConfigEntity {
  abi: string;
  network: string;
  contract: string;
  startBlock: number;
}

interface IndexerConfig {
  entities: IndexerConfigEntity[];
  getAllNetworks: () => EVMNetwork[];
}

export function getIndexerConfig(): IndexerConfig {
  const content = readFileSync('./indexer.config.json', 'utf-8');
  const obj = JSON.parse(content) as IndexerConfig;
  obj.getAllNetworks = () => {
    const providers = new Set<EVMNetwork>();
    obj.entities.forEach(entity => {
      providers.add(convertToNetworkEnum(entity.network));
    });
    return Array.from(providers);
  };
  return obj;
}
