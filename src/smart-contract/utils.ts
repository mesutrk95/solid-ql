import {Interface} from 'ethers';
import {readFileSync} from 'fs';
import {DataTypes} from 'sequelize';

export function solidityTypeToSequelizeType(type: string) {
  switch (type) {
    case 'string':
      return DataTypes.STRING;
    case 'bool':
      return DataTypes.BOOLEAN;
    case 'address':
      return DataTypes.STRING;
    case 'uint256':
    case 'uint128':
    case 'uint64':
    case 'uint32':
    case 'uint16':
    case 'uint8':
      return DataTypes.BIGINT;
    case 'int256':
    case 'int128':
    case 'int64':
    case 'int32':
    case 'int16':
    case 'int8':
      return DataTypes.BIGINT;
    case 'bytes':
      return DataTypes.BLOB;
    default:
      throw new Error(`Unexpected type in abi file: ${type}`);
  }
}

export function loadContractInterface(path: string): Interface {
  const content: string = readFileSync(path, 'utf-8');
  const {abi} = JSON.parse(content);
  const contractInterface = new Interface(abi);
  return contractInterface;
}
