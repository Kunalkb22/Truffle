require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');
//Set up your network configuration for Alchemy:
module.exports = {
networks: {
development: {
host: '127.0.0.1',
port: 7545,
network_id: '*',
},
privateNetwork: {
provider: () => new HDWalletProvider(process.env.MNEMONIC,
process.env.ALCHEMY_API_KEY),
network_id: 11155111,
gas: 4500000,
gasPrice: 10000000000,
},
},
compilers: {
solc: {
version: '0.8.0',
},
},
};