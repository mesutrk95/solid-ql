import {EventLog, ethers} from 'ethers';
import {SmartContract} from '../SmartContract';

export async function start() {
  //   const provider = new ethers.AlchemyProvider(
  //     'sepolia',
  //     'UWGpZO1vwXneuuoMUhVOWw_meeUC8WDT'
  //   );
  //   const contract = new SmartContract(
  //     '../artifacts/contracts/Auction.sol/Auction.json',
  //     '0x07D83C72110dbFcE0Ba41aFb95905Bf7E1D3f949',
  //     provider
  //   );
  //   const events = await contract.getBlockEvents('AuctionItemCreated', 4673726);
  //   console.log('createddddd', events);
  //   const sub = contract.listenEvents(
  //     'AuctionItemCreated',
  //     (values: EventLog) => {
  //       console.log('new eveeeeeeeeeeeeeeeeeeeeeeent', values);
  //     }
  //   );
  //   sub.unsubscribe();
  //   // console.log(contract.getEvent('AuctionItemCreated'));
}
