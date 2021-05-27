require("@nomiclabs/hardhat-waffle");
require('hardhat-deploy')
require('hardhat-deploy-ethers')
require('solidity-coverage')
require('hardhat-dependency-compiler')
// require('hardhat-gas-reporter')
require('hardhat-abi-exporter')

const networks = require('./hardhat.networks')

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers:[
      {
        version: "0.7.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion: "istanbul"
        }
      },
      {
        version: "0.6.12",
        settings:{
          optimizer: {
            enabled: true,
            runs: 200
          },
          evmVersion:"istanbul"
        }
      }
    ]

  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
    owner: {
      default : 0,
      1: "0x029Aa20Dcc15c022b1b61D420aaCf7f179A9C73f",
      4: "0x72c9aA4c753fc36cbF3d1fF6fEc0bC44ad41D7f2"
    },
    podsRegistry: {
      1: "0x4658f736b93dCDdCbCe46cDe955970E697fd351f",
      4: "0xe89f13fD3e5f13f49B6C4c48ae7104A01f2E70cF"
    }
    
  },
  networks,
  abiExporter: {
    path: './abis',
    clear: true,
    flat: true
  },
  dependencyCompiler: {
    paths:[
      "@pooltogether/pooltogether-generic-registry/contracts/AddressRegistry.sol"
    ]
  }
};
