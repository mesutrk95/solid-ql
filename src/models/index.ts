import {Sequelize, DataTypes, ModelAttributes, Model} from 'sequelize';

interface DBModelColumn {
  name: string;
  type: DataTypes.DataTypeAbstract;
  allowNull?: boolean;
  // default: any;
}

function defineModel(name: string, columns: DBModelColumn[]) {
  const modelColumns: ModelAttributes<Model<any, any>> = {};
  columns.forEach((col: DBModelColumn) => {
    modelColumns[col.name] = {
      type: col.type,
      allowNull: col.allowNull,
      // default: col.default,
    };
  });

  const model = sequelize.define(name, columns, {
    // Other model options go here
  });
  return model;
}

const sequelize = new Sequelize(process.env.DATABASE_URL as string);

export const connect = async () => {
  try {
    await sequelize.authenticate();
    sequelize.sync({
      force: true,
    });
    console.log('Connection has been established successfully.');

    defineModel('MyTestModel', [
      {name: 'name', allowNull: true, type: DataTypes.STRING},
    ] as DBModelColumn[]);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
