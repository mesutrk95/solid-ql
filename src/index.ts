import * as dotenv from 'dotenv';
dotenv.config();

import {connect} from './models';

(async () => {
  console.log('started');
  await connect();
})();
