#!/usr/bin/env node

const path = require('path');
const {prepare} = require('./dist');

function getProjectConfigPath() {
  const targetPath = process.cwd();
  const configFile = path.join(targetPath, 'evm-indexer.json');
  return configFile;
}
console.log('loading config from', getProjectConfigPath());
prepare(getProjectConfigPath());
