import {DataTypes} from 'sequelize';

export function sequelizeToGraphqlType(sequelizeType: DataTypes.DataType) {
  switch (sequelizeType) {
    case DataTypes.STRING.key:
    case DataTypes.TEXT.key:
    case DataTypes.UUID.key:
    case DataTypes.UUIDV1.key:
    case DataTypes.UUIDV4.key:
    case DataTypes.JSON.key:
    case DataTypes.JSONB.key:
      return 'String';

    case DataTypes.FLOAT.key:
    case DataTypes.REAL.key:
    case DataTypes.DOUBLE.key:
      return 'Float';

    case DataTypes.INTEGER.key:
    case DataTypes.BIGINT.key:
    case DataTypes.DECIMAL.key:
      return 'Int';

    case DataTypes.BOOLEAN.key:
      return 'Boolean';

    case DataTypes.DATE.key:
    case DataTypes.DATEONLY.key:
    case DataTypes.TIME.key:
      return 'Date';

    case DataTypes.ENUM.key:
      return 'String';
    default:
      return 'String';
  }
}
