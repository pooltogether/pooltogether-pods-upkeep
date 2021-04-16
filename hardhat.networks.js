const networks = {}

if(process.env.ALCHEMY_URL && process.env.FORK_ENABLED){
  networks.hardhat = {
    chainId: 1,
    forking: {
      url: process.env.ALCHEMY_URL,
      blockNumber: 12077369
    },
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC
    },
    // allowUnlimitedContractSize: true
  }
} else {
  networks.hardhat = {
    allowUnlimitedContractSize: true
  }
}

if (process.env.INFURA_API_KEY && process.env.HDWALLET_MNEMONIC) {

  networks.localhost = {
    url: 'http://127.0.0.1:8545',
    blockGasLimit: 200000000,
    allowUnlimitedContractSize: true
  }

  networks.kovan = {
    saveDeployments: true,
    url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC
    }
  }

  networks.ropsten = {
    saveDeployments: true,
    url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC
    }
  }

  networks.rinkeby = {
    saveDeployments: true,
    url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC
    }
  }

  networks.mainnet = {
    saveDeployments: true,
    url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
    accounts: {
      mnemonic: process.env.HDWALLET_MNEMONIC
    }
  }
} else {
  console.warn('No infura or hdwallet available for testnets')
}

module.exports = networks