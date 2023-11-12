import {Sequelize, DataTypes, ModelAttributes, Model} from 'sequelize';
import {
  loadContractInterface,
  solidityTypeToSequelizeType,
} from '../SmartContract/utils';
import {EventFragment} from 'ethers';

export const sequelize = new Sequelize(process.env.DATABASE_URL as string);

export interface DBModelColumn {
  name: string;
  type: DataTypes.DataTypeAbstract;
  allowNull?: boolean;
  default?: string | number | Object | undefined;
}

export function defineModel(name: string, columns: DBModelColumn[]) {
  const modelColumns: ModelAttributes<Model> = {};
  modelColumns.eventId = {type: DataTypes.STRING};
  modelColumns.network = {type: DataTypes.STRING};
  modelColumns.blockNumber = {type: DataTypes.INTEGER};

  columns.forEach((col: DBModelColumn) => {
    modelColumns[col.name] = {
      type: col.type,
      allowNull: col.allowNull,
      defaultValue: col.default,
    };
  });

  const model = sequelize.define(name, modelColumns, {
    // Other model options go here
  });
  return model;
}

export const connectDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

export const sync = async (force = false) => {
  try {
    await sequelize.sync({
      force,
    });
  } catch (error) {
    console.error('Unable to sync the database:', error);
  }
};

async function loadAllSmartContractModels(files: string[]) {
  for (const file of files) {
    const contractInterface = await loadContractInterface(file);
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
      defineModel(event.name, columns);
    }
  }
}

export async function generateAllDatabaseModels(files: string[]) {
  loadAllSmartContractModels(files);

  sequelize.define(
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
