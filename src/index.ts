import * as dotenv from 'dotenv';
dotenv.config();

import * as models from './models';
import {start} from './blockchain';
import {getIndexerConfig} from './helpers';
import {createProvider} from './helpers/providers';
import {SmartContract} from './SmartContract';
import {convertToNetworkEnum} from './blockchain/networks';
const hash = (s: string) => {
  return Math.abs(
    s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0)
  );
};

(async () => {
  await models.connectDatabase();
  await models.generateAllDatabaseModels([
    '../artifacts/contracts/Auction.sol/Auction.json',
  ]);
  await models.sync(true);

  const config = getIndexerConfig();
  const providers = new Map();
  config.getAllNetworks().forEach(pk => {
    const provider = createProvider(pk);
    providers.set(pk, provider);
  });

  config.entities.forEach(async entity => {
    const {abi, contract, network, startBlock} = entity;
    const provider = providers.get(convertToNetworkEnum(network));
    const currentBlock = await provider.getBlockNumber();
    const smartContract = new SmartContract(abi, contract, provider);

    const eventFragments = smartContract.getEvents();
    for (const ef of eventFragments) {
      const events = await smartContract.getBlockEvents(
        ef.name,
        startBlock,
        currentBlock
      );
      // console.log(events);

      for (const event of events) {
        const record: any = {};
        record.blockNumber = event.blockNumber;
        record.network = network.toLowerCase();
        for (const ev of event.values) {
          record[ev.name] = ev.value.toString();
        }
        const recordStr = JSON.stringify(record);
        const eventId = hash(recordStr);
        record.eventId = eventId;
        await models.sequelize.models[ef.name].create(record);
      }
    }
  });
  // await start();
})();
