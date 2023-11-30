import {Sequelize, DataTypes, ModelAttributes, Model} from 'sequelize';
import {
  loadContractInterface,
  solidityTypeToSequelizeType,
} from '../SmartContract/utils';
import {EventFragment} from 'ethers';
import AppConfig from '../config';

export interface DBModelColumn {
  name: string;
  type: DataTypes.DataTypeAbstract;
  allowNull?: boolean;
  default?: string | number | Object | undefined;
}

export default class Models {
  sequelize: Sequelize;

  constructor() {
    const config = AppConfig.getInstance();
    this.sequelize = new Sequelize(config.db, {logging: false});
  }

  private defineModel(name: string, columns: DBModelColumn[]) {
    const modelColumns: ModelAttributes<Model> = {};
    modelColumns.eventId = {type: DataTypes.INTEGER};
    modelColumns.network = {type: DataTypes.STRING};
    modelColumns.blockNumber = {type: DataTypes.INTEGER};
    modelColumns.txHash = {type: DataTypes.STRING};

    columns.forEach((col: DBModelColumn) => {
      modelColumns[col.name] = {
        type: col.type,
        allowNull: col.allowNull,
        defaultValue: col.default,
      };
    });

    const model = this.sequelize.define(name, modelColumns, {
      // Other model options go here
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

    this.sequelize.define(
      'IndexStatus',
      {
        contract: {
          type: DataTypes.STRING,
        },
        eventName: {
          type: DataTypes.STRING,
        },
        network: {
          type: DataTypes.STRING,
        },
        blockNumber: {
          type: DataTypes.INTEGER,
        },
      },
      {
        // Other model options go here
      }
    );
  }
}
