import {buildSchema} from 'graphql';
import * as express from 'express';
import {graphqlHTTP} from 'express-graphql';

import Models from '../models';
import {loadContractInterface} from '../smart-contract/utils';
import {QueryTypes} from 'sequelize';
import AppConfig from '../config';
import {sequelizeToGraphqlType} from './utils';

export default class Graph {
  async start(models: Models) {
    const tables: string[] = [];
    const config = AppConfig.getInstance();

    for (const entity of config.contracts) {
      const {abi} = entity;
      const contract = loadContractInterface(abi);
      contract.forEachEvent(event => tables.push(event.name));
    }

    const rawSchema = `

        input Filter {
          column: String!
          type: String!
          value: String!
        }

        ${tables
          .map(table => {
            const columns = models.sequelize.models[table].getAttributes();

            return `
            type ${table} {
                ${Object.keys(columns)
                  .map(
                    column =>
                      `${column}: ${sequelizeToGraphqlType(
                        columns[column].type
                      )}
                      `
                  )
                  .join('')}
            }
            `;
          })
          .join('')}
 
        type Query {
            ${tables
              .map(
                table =>
                  `get${table}(page: Int, pageSize: Int, filters: [Filter]): [${table}]
                `
              )
              .join('')}
        }`;

    const root = {} as any;
    for (const table of tables) {
      root[`get${table}`] = async (q: {
        page: number;
        pageSize: number;
        filters: {column: string; type: string; value: string}[];
      }) => {
        const {page, pageSize, filters} = q;
        const offset = ((page || 1) - 1) * (pageSize || 10);

        let query = `SELECT * FROM "${table}s"`;

        if (filters && filters.length > 0) {
          let queryText = '';

          filters.forEach((filter, index) => {
            if (index > 0) {
              queryText += ' AND ';
            }

            const {column, type, value} = filter;

            if (type === 'substring') {
              queryText += `"${column}" ILIKE %${value}%`;
            } else if (type === 'equals') {
              queryText += `"${column}"='${value}'`;
            } else if (type === 'not equals') {
              queryText += `"${column}"!='${value}'`;
            }
            console.log(queryText);
          });
          query += ` WHERE ${queryText}`;
        }
        query += ` OFFSET ${offset} LIMIT ${pageSize || 10}`;

        const result = await models.sequelize.query(query, {
          type: QueryTypes.SELECT,
          logging: console.log,
        });
        return result;
      };
    }

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

    app.listen(config.graph.port, () => {
      console.log(
        `graphQL server started at http://localhost:${config.graph.port}/graphql`
      );
    });
  }
}
