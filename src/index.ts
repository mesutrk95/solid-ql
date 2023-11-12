import * as dotenv from 'dotenv';
dotenv.config();

import * as models from './models';
import {start} from './blockchain';

(async () => {
  await models.connectDatabase();
  await models.generateAllDatabaseModels([
    '../artifacts/contracts/Auction.sol/Auction.json',
  ]);
  await models.sync();

  await start();
})();
