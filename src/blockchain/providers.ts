import {JsonRpcProvider, ethers} from 'ethers';
import {EVMNetwork} from './networks';
import AppConfig from '../config';

export function createProvider(
  network: EVMNetwork
): JsonRpcProvider | undefined {
  const config = AppConfig.getInstance();

  const provider = config.providers[network];
  if (!provider) {
    throw new Error(`No provier defined for network ${network.toString()}`);
  }

  switch (provider.type) {
    case 'json-rpc':
      return new ethers.JsonRpcProvider(provider.rpcUrl);
    case 'alchemy':
      if (network === 'ethereum') {
        return new ethers.AlchemyProvider('main', provider.key);
      } else {
        return new ethers.AlchemyProvider(network, provider.key);
      }
    case 'infura':
      return new ethers.InfuraProvider(network, provider.key);

    default:
      throw new Error(`Network ${network} is not defined!`);
  }
}
