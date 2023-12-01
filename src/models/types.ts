import {DataTypes} from 'sequelize';

export interface DBModelColumn {
  name: string;
  type: DataTypes.DataTypeAbstract;
  allowNull?: boolean;
  default?: string | number | Object | undefined;
}
