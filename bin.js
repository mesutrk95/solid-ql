#!/usr/bin/env node

const program = require('commander');
const Indexer = require('./dist').default;
const path = require('path');
const {exit} = require('process');

program
  .version('1.0.0')
  .description(
    'EVM Indexer - Index Ethereum Virtual Machine (EVM) artifacts in a directory.'
  )
  .arguments('<directory>')
  .option('-c, --clean', 'clean the database schemas before making models')
  .option(
    '-s, --sync',
    'Index old events starting from startBlock parameter in config file'
  )
  .option('-w, --watch', 'watch for the new blockchain events')
  .option('-g, --graph', 'start the graphQL server')
  .parse(process.argv);

program.parse();
const options = program.opts();

// Check if a directory argument is provided
if (!program.args.length) {
  console.error('Error: please provide the path to the directory.');
  program.help();
}

function getProjectConfigPath() {
  const directory = program.args[0];
  const target = path.resolve(directory);
  const configFile = path.join(target, 'evm-indexer.json');
  return configFile;
}

const configFile = getProjectConfigPath();
console.log('loading config from', Indexer);
const indexer = new Indexer(configFile);
indexer.prepare().then(async () => {
  if (options.clean) {
    console.log('cleaning the database schemas and generating them again');
    await indexer.sync(true);
  }

  if (options.sync) {
    console.log('indexing old events starting from startBlock');
    await indexer.processOldEvents();
  }

  if (options.watch) {
    console.log('watching the network for new events...');
    await indexer.watch();
  }

  if (options.graph) {
    console.log('graph started for the project');
    await indexer.startGraph();
  }
});

process.on('SIGINT', async () => {
  console.log('\nclosing watchers ...');
  await indexer.destroy();
  console.log('bye!');
  exit(0);
});
