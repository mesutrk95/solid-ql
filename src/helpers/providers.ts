import {JsonRpcProvider, ethers} from 'ethers';
import {EVMNetwork, convertToNetworkEnum} from '../blockchain/networks';

const ALCHEMY_APIKEY = 'UWGpZO1vwXneuuoMUhVOWw_meeUC8WDT';

export function createProvider(
  networkName: string
): JsonRpcProvider | undefined {
  const network = convertToNetworkEnum(networkName);
  switch (network) {
    case EVMNetwork.ETHEREUM:
      return new ethers.AlchemyProvider('main', ALCHEMY_APIKEY);
    case EVMNetwork.SEPOLIA:
      return new ethers.AlchemyProvider('sepolia', ALCHEMY_APIKEY);
    case EVMNetwork.BSC_TEST:
      return new ethers.JsonRpcProvider(
        'https://data-seed-prebsc-2-s1.binance.org:8545/'
      );

    default:
      throw new Error(`Network ${network} is not defined!`);
  }
}
