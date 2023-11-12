export enum EVMNetwork {
  ETHEREUM,
  SEPOLIA,
  BSC,
  BSC_TEST,
}

export function convertToNetworkEnum(network: string) {
  const key = network.toUpperCase();
  const networkType = EVMNetwork[key as keyof typeof EVMNetwork];
  return networkType;
}
