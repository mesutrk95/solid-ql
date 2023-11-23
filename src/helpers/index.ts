import {readFileSync} from 'fs';
import {EVMNetwork, convertToNetworkEnum} from '../blockchain/networks';

interface IndexerConfigEntity {
  abi: string;
  network: string;
  contract: string;
  startBlock: number;
}

interface IndexerConfig {
  contracts: IndexerConfigEntity[];
  getAllNetworks: () => EVMNetwork[];
}

export function getIndexerConfig(configFile: string): IndexerConfig {
  const content = readFileSync(configFile, 'utf-8');
  const obj = JSON.parse(content) as IndexerConfig;
  obj.getAllNetworks = () => {
    const providers = new Set<EVMNetwork>();
    obj.contracts.forEach(contract => {
      providers.add(convertToNetworkEnum(contract.network));
    });
    return Array.from(providers);
  };
  return obj;
}
