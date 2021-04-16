const { deployMockContract } = require('ethereum-waffle')
const { expect } = require('chai')
const hre = require('hardhat')

const SENTINAL = '0x0000000000000000000000000000000000000001'

let overrides = { gasLimit: 200000000 }

describe('PrizePoolRegistry', function() {


  let wallet, wallet2, wallet3, wallet4
  let prizePoolRegistry;


  let prizePool1, prizePool2, prizePool3
  let prizeStrategy

  before(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
    const prizePoolRegistryContractFactory = await hre.ethers.getContractFactory("PrizePoolRegistry", wallet, overrides)
    prizePoolRegistry = await prizePoolRegistryContractFactory.deploy()
    

    const PrizePool = await hre.artifacts.readArtifact("PrizePool")
    prizePool1 = await deployMockContract(wallet, PrizePool.abi, overrides)
    prizePool2 = await deployMockContract(wallet, PrizePool.abi, overrides)
    
    const PeriodicPrizeStrategy = await hre.artifacts.readArtifact("PeriodicPrizeStrategy")
    prizeStrategy = await deployMockContract(wallet, PeriodicPrizeStrategy.abi, overrides)
 
    await prizePool1.mock.prizeStrategy.returns(prizeStrategy.address)
    await prizePool2.mock.prizeStrategy.returns(prizeStrategy.address)

  })

  describe('Owner able to add/remove prize pools to the registry', () => {
    it('adds pools to the registry', async () => {
      await expect(prizePoolRegistry.addPrizePools([prizePool1.address, prizePool2.address]))
      .to.emit(prizePoolRegistry, "PrizePoolAdded")
      .withArgs(prizePool1.address)
    })

    it('returns all pool addresses registered', async () => {
      const resultArr = await prizePoolRegistry.callStatic.getPrizePools()
      expect(resultArr).to.deep.equal([prizePool2.address, prizePool1.address])
    })

    it('removes a pool from the registry', async () => {
      await expect(prizePoolRegistry.removePrizePool(prizePool2.address, prizePool1.address))
      .to.emit(prizePoolRegistry, "PrizePoolRemoved").withArgs(prizePool1.address)
    })

    it('reverts when non-owner tries to add a prizePool', async () => {
      await expect(prizePoolRegistry.connect(wallet2).addPrizePools([prizeStrategy.address])).to.be.revertedWith("Ownable: caller is not the owner")    
    })
    
    it('reverts when non-owner tries to remove a prizePool', async () => {
      await expect(prizePoolRegistry.connect(wallet2).removePrizePool(prizeStrategy.address, SENTINAL)).to.be.revertedWith("Ownable: caller is not the owner")    
    })

    it('reverts when prizePool already added', async () => {      
      await expect(prizePoolRegistry.addPrizePools([prizePool2.address])).to.be.revertedWith("Already added")    
    })

  })

});
