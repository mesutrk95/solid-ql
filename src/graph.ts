import {buildSchema} from 'graphql';
import * as express from 'express';
import {graphqlHTTP} from 'express-graphql';

import Models from './models';
import {IndexerConfig} from './helpers';
import {loadContractInterface} from './SmartContract/utils';
import {EventFragment} from 'ethers';
import {QueryTypes} from 'sequelize';

type User = {
  id: number;
  name: string;
  email: string;
};

type UserInput = Pick<User, 'email' | 'name'>;

const users = [
  {id: 1, name: 'John Doe', email: 'johndoe@gmail.com'},
  {id: 2, name: 'Jane Doe', email: 'janedoe@gmail.com'},
  {id: 3, name: 'Mike Doe', email: 'mikedoe@gmail.com'},
];

const getUser = (args: {id: number}): User | undefined =>
  users.find(u => u.id === args.id);

const getUsers = (): User[] => users;

const createUser = (args: {input: UserInput}): User => {
  const user = {
    id: users.length + 1,
    ...args.input,
  };
  users.push(user);

  return user;
};

const updateUser = (args: {user: User}): User => {
  const index = users.findIndex(u => u.id === args.user.id);
  const targetUser = users[index];

  if (targetUser) users[index] = args.user;

  return targetUser;
};

const root = {
  getUser,
  getUsers,
  createUser,
  updateUser,
};

export default class Graph {
  async start(config: IndexerConfig, models: Models) {
    const tables: string[] = [];
    for (const entity of config.contracts) {
      const {abi} = entity;
      const contract = loadContractInterface(abi);
      contract.forEachEvent(event => tables.push(event.name));
    }
    // const results = await models.sequelize.query(
    //   "select table_schema, table_name from information_schema.tables where table_schema='public'"
    // );
    // const result = results[0] as {table_name: string}[];
    // const tables = result.map(r => r.table_name);

    const rawSchema = `
         
        type User {
            id: Int!
            name: String!
            email: String!
        }

        ${tables.map(table => {
          console.log(table);
          const columns = models.sequelize.models[table].getAttributes();
          for (const column of Object.keys(columns)) {
            console.log(column);
          }
          console.log(columns);

          return `
                type ${table} {
                    id: Int!
                    name: String!
                    email: String!
                }
            `;
        })}
 
        type Query {
            getUser(id: String): User
            getUsers: [User]
        }`;
    const schema = buildSchema(rawSchema);
    const app = express();

    app.use(
      '/graphql',
      graphqlHTTP({
        schema: schema,
        rootValue: root,
        graphiql: true,
      })
    );

    const PORT = 8000;

    app.listen(PORT);

    console.log(
      `Running a GraphQL API server at http://localhost:${PORT}/graphql`
    );
  }
}
