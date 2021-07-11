const HDWalletProvider = require("@truffle/hdwallet-provider");
const provider = new HDWalletProvider({
	privateKeys: [""],
	providerOrUrl: "https://rpc-testnet.kcc.network"
	
});
module.exports = {
  // Uncommenting the defaults below
  // provides for an easier quick-start with Ganache.
  // You can also follow this format for other networks;
  // see <http://truffleframework.com/docs/advanced/configuration>
  // for more details on how to specify configuration options!
  //
  networks: {
   development: {
     host: "127.0.0.1",
     port: 8545,
     network_id: "*"
   },
   kcctestnet: {
    provider: () => provider,
    network_id: 322,
    gas: 5000000,
    gasPrice: 50000000000,  // 1 gwei (in wei)
    confirmations: 1,
	networkCheckTimeout: 1000000,
    timeoutBlocks: 50000,
    skipDryRun: true
   },
   kccmainnet: {
    provider: () => provider,
    network_id: 1,
    gas: 5000000,
    gasPrice: 50000000000,  // 5 gwei (in wei)
    confirmations: 1,
	networkCheckTimeout: 1000000,
    timeoutBlocks: 50000,
    skipDryRun: true
   }
  },  
  compilers: {
    solc: {
      version: "0.6.12",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200,
        }
      }
    }
  }
};