require("@nomiclabs/hardhat-truffle5");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.12",
  networks: {
    hardhat: {
      gasPrice: "auto",
      allowUnlimitedContractSize: true
    }
  },
  settings: {
    evmVersion: "istanbul",
    optimizer: {
      enabled: true,
      runs: 999999,
    },
  }
};
