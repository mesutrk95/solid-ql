import {Sequelize} from 'sequelize';

// Option 1: Passing a connection URI
const sequelize = new Sequelize(
  'postgres://postgres:masoud1234@localhost:5432/crafteo-indexer'
); // Example for postgres

export const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};
