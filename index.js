var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
var readyaml = require('read-yaml');

var classes = require('./build/classes.json');

var dappfile = readyaml.sync('./dappfile');

var live = dappfile.environments.live;
var simpleStorageAddress = live.objects.simpleStorage.address;
var simpleStorageAbi = JSON.parse(classes.SimpleStorage.interface);

var SimpleStorage = web3.eth.contract(simpleStorageAbi);
var simpleStorage = SimpleStorage.at(simpleStorageAddress);

console.log('your value is',simpleStorage.get().toString());

