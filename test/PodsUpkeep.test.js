const { deployMockContract } = require('ethereum-waffle')
const hre = require('hardhat')
const { expect } = require('chai')

let overrides = { gasLimit: 200000000 }

const SENTINAL = '0x0000000000000000000000000000000000000001'

describe('Pods Upkeep', function() {


  let wallet, wallet2
  let podsRegistry;
  let podsUpkeep

  let pod1, pod2

  beforeEach(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
  
    const podsRegistryContractFactory = await hre.ethers.getContractFactory("AddressRegistry", wallet, overrides)
    podsRegistry = await podsRegistryContractFactory.deploy("Pods", wallet.address)
  
    const podsUpkeepContractFactory = await hre.ethers.getContractFactory("PodsUpkeep", wallet, overrides)
    podsUpkeep = await podsUpkeepContractFactory.deploy(podsRegistry.address, wallet.address, 0)

    const MockPodArtifact = await hre.artifacts.readArtifact("MockPod")
    pod1 = await deployMockContract(wallet, MockPodArtifact.abi, overrides)
    pod2 = await deployMockContract(wallet, MockPodArtifact.abi, overrides)

    await podsRegistry.addAddresses([pod1.address, pod2.address])
    
  })

  describe('Only owner can call admin functions ', () => {
    it('can update the block interval', async () => {
      expect(await podsUpkeep.updateBlockUpkeepInterval(5))
      expect(await podsUpkeep.updateBlockUpkeepInterval(6)).
        to.emit(podsUpkeep, "UpkeepBlockIntervalUpdated").withArgs(6)

    })

    it('non owner cannot update the block interval', async () => {
      await expect(podsUpkeep.connect(wallet2).updateBlockUpkeepInterval(5)).
        to.be.revertedWith("Ownable: caller is not the owner")
    })
  })

  describe('able to call checkUpkeep()', () => {
    it('block interval passed, upkeep needed', async () => {
      await podsUpkeep.updateBlockUpkeepInterval(1)
            
      const checkResult = await podsUpkeep.callStatic.checkUpkeep("0x")
      expect(checkResult[0]).to.be.equal(true)
    })

    it('block interval not passed, upkeep not needed', async () => {
      await podsUpkeep.updateBlockUpkeepInterval(1000)
      let provider = hre.ethers.provider

      const checkResult = await podsUpkeep.callStatic.checkUpkeep("0x")
      expect(checkResult[0]).to.be.equal(false)
    })

    it('upkeep not needed, block interval passed, then needed', async () => {
      const provider = hre.ethers.provider

      // performing Upkeep so that the lastUpdatedBlockNumbers are recorded
      await podsUpkeep.updateBlockUpkeepInterval(0)
      await pod1.mock.batch.returns(true)
      await pod2.mock.batch.returns(true)
      await podsUpkeep.performUpkeep("0x")


      const upkeepInterval = 20
      await podsUpkeep.updateBlockUpkeepInterval(upkeepInterval)
      // now should not require upkeep since interval has not passed
      const checkResultStart = await podsUpkeep.callStatic.checkUpkeep("0x")
      expect(checkResultStart[0]).to.be.equal(false)

      // move forward the upkeepIntervalnumber of blocks
      for(let index = 0; index < upkeepInterval; index++){
        await provider.send('evm_mine', [])
      }
      // should now require upKeep      
      const checkResultEnd = await podsUpkeep.callStatic.checkUpkeep("0x")
      expect(checkResultEnd[0]).to.be.equal(true)
    })

  })


  describe('able to call performUpkeep()', () => {

    it('can execute batch()', async () => {

      await podsUpkeep.updateBlockUpkeepInterval(1)
   
      await pod1.mock.batch.revertsWithReason("batch-mock-revert")
      await pod2.mock.batch.revertsWithReason("batch-mock-revert")
      await expect(podsUpkeep.performUpkeep("0x")).to.be.revertedWith("batch-mock-revert")
    })

    it('reverts on execute batch()', async () => {

      await podsUpkeep.updateBlockUpkeepInterval(1)
      await pod1.mock.batch.returns(false)
      // await expect(podsUpkeep.performUpkeep("0x")).to.be.revertedWith("PodsUpkeep: batch() failed")
      await expect(podsUpkeep.performUpkeep("0x")).to.be.reverted
    })

  })

});
