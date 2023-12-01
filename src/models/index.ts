import {Sequelize, DataTypes, ModelAttributes, Model} from 'sequelize';
import {EventFragment} from 'ethers';

import {
  loadContractInterface,
  solidityTypeToSequelizeType,
} from '../smart-contract/utils';
import AppConfig from '../config';
import {DBModelColumn} from './types';

export function getColumnName(columnName: string) {
  const prefix = AppConfig.getInstance().store.columnsPrefix;
  return `${prefix}_${columnName}`;
}

export default class Models {
  sequelize: Sequelize;

  constructor() {
    const config = AppConfig.getInstance();
    this.sequelize = new Sequelize(config.store.url, {logging: false});
  }

  private defineModel(name: string, columns: DBModelColumn[]) {
    const tableColumns: ModelAttributes<Model> = {};
    tableColumns[getColumnName('eventId')] = {type: DataTypes.INTEGER};
    tableColumns[getColumnName('network')] = {type: DataTypes.STRING};
    tableColumns[getColumnName('blockNumber')] = {type: DataTypes.INTEGER};
    tableColumns[getColumnName('txHash')] = {type: DataTypes.STRING};
    tableColumns[getColumnName('contract')] = {type: DataTypes.STRING};

    columns.forEach((col: DBModelColumn) => {
      tableColumns[col.name] = {
        type: col.type,
        allowNull: col.allowNull,
        defaultValue: col.default,
      };
    });

    const model = this.sequelize.define(name, tableColumns, {
      underscored: false,
      indexes: [
        {
          unique: true,
          fields: [getColumnName('eventId')],
        },
        {
          unique: false,
          fields: [getColumnName('contract')],
        },
        {
          unique: false,
          fields: [getColumnName('network')],
        },
      ],
    });
    return model;
  }

  async connect() {
    try {
      await this.sequelize.authenticate();
      console.log('Connection has been established successfully.');
    } catch (error) {
      console.error('Unable to connect to the database:', error);
    }
  }

  async sync(force = false) {
    try {
      await this.sequelize.sync({
        force,
      });
    } catch (error) {
      console.error('Unable to sync the database:', error);
    }
  }

  private async loadAllSmartContractModels(abiFile: string) {
    const contractInterface = await loadContractInterface(abiFile);
    const events = contractInterface.fragments.filter(
      f => f.type === 'event'
    ) as EventFragment[];

    for (const event of events) {
      const columns: DBModelColumn[] = [];
      for (const input of event.inputs) {
        const {type, name} = input;
        const dbType = solidityTypeToSequelizeType(type);
        columns.push({
          name,
          type: dbType,
        } as DBModelColumn);
      }
      this.defineModel(event.name, columns);
    }
  }

  async generateAllDatabaseModels(abiFile: string) {
    this.loadAllSmartContractModels(abiFile);
  }
}
