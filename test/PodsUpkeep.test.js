const { deployMockContract } = require('ethereum-waffle')
const hre = require('hardhat')
const { expect } = require('chai')

let overrides = { gasLimit: 200000000 }

const SENTINAL = '0x0000000000000000000000000000000000000001'

describe('Pods Upkeep', function() {


  let wallet, wallet2, wallet3, wallet4
  let podsRegistry;
  let podsUpkeep

  let pod1, pod2
  let prizeStrategy

  before(async () => {

    [wallet, wallet2, wallet3, wallet4] = await hre.ethers.getSigners()
  
    const podsRegistryContractFactory = await hre.ethers.getContractFactory("AddressRegistry", wallet, overrides)
    podsRegistry = await podsRegistryContractFactory.deploy("Pods", wallet.address)
  
    const podsUpkeepContractFactory = await hre.ethers.getContractFactory("PodsUpkeep", wallet, overrides)
    podsUpkeep = await podsUpkeepContractFactory.deploy(podsRegistry.address, wallet.address)


    const MockPodArtifact = await hre.artifacts.readArtifact("MockPod")
    pod1 = await deployMockContract(wallet, MockPodArtifact.abi, overrides)
    pod2 = await deployMockContract(wallet, MockPodArtifact.abi, overrides)

    
    await podsRegistry.addAddresses([pod1.address, pod2.address])
    
    // await pod1.mock.prizeStrategy.returns(prizeStrategy.address)
    // await pod2.mock.prizeStrategy.returns(prizeStrategy.address)


    // await prizeStrategy.mock.canCompleteAward.returns(true)
    // await prizeStrategy.mock.canStartAward.returns(true)

    // await prizeStrategy.mock.startAward.returns()
    // await prizeStrategy.mock.completeAward.returns()

  })

  describe.only('Only owner can call admin functions ', () => {
    it('can update the block interval', async () => {
      expect(await podsUpkeep.updateBlockUpkeepInterval(5))
      expect(await podsUpkeep.updateBlockUpkeepInterval(6)).
        to.emit(podsUpkeep, "UpkeepBlockIntervalUpdated").withArgs(6)

    })
    it('non owner cannot update the block interval', async () => {
      await expect(podsUpkeep.connect(wallet2).updateBlockUpkeepInterval(5)).
        to.be.revertedWith("Ownable: caller is not the owner")
    })
    it('can update the target float fraction', async () => {
      expect(await podsUpkeep.updateTargetFloatFractionInterval(5))
      expect(await podsUpkeep.updateTargetFloatFractionInterval(6)).
        to.emit(podsUpkeep, "TargetFloatFractionUpdated").withArgs(6)

    })
    it('non owner cannot update the target float fraction', async () => {
      await expect(podsUpkeep.connect(wallet2).updateTargetFloatFractionInterval(5)).
        to.be.revertedWith("Ownable: caller is not the owner")
    })
  })




  describe('able to call checkUpkeep()', () => {
    it('can check canStartAward()', async () => {
      await prizeStrategy.mock.canStartAward.returns(true)
      const resultArr = await podsUpkeep.callStatic.checkUpkeep("0x")
      expect(resultArr[0]).to.be.equal(true)
    })
    
    it('can check canCompleteAward()', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(true)
      await prizeStrategy.mock.canStartAward.returns(false)
      const resultArr = await podsUpkeep.callStatic.checkUpkeep("0x")
      expect(resultArr[0]).to.be.equal(true)
    })
    
    it('no upkeep required', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(false)
      await prizeStrategy.mock.canStartAward.returns(false)
      const resultArr = await podsUpkeep.callStatic.checkUpkeep("0x")
      expect(resultArr[0]).to.be.equal(false)
    })
  })

  describe('able to call performUpkeep()', () => {

    let mockContractFactory, mockContract

    before(async() => {
      mockContractFactory = await hre.ethers.getContractFactory("MockContract", wallet3, overrides)
      mockContract = await mockContractFactory.deploy(SENTINAL)
    })
  
    it('can execute startAward()', async () => {
      await prizeStrategy.mock.canStartAward.returns(true)
      await prizeStrategy.mock.startAward.revertsWithReason("startAward")
      await expect(podsUpkeep.performUpkeep("0x")).to.be.revertedWith("startAward")
    })
    it('can execute completeAward()', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(true)
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizeStrategy.mock.completeAward.revertsWithReason("completeAward")
      await expect(podsUpkeep.performUpkeep("0x")).to.be.revertedWith("completeAward")
    })
    it('cannot startAward()', async () => {
      await prizeStrategy.mock.canCompleteAward.returns(false)
      await prizeStrategy.mock.canStartAward.revertsWithReason("startAward")
      await expect(podsUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("startAward")
    })
    it('cannot completeAward()', async () => {
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizeStrategy.mock.canCompleteAward.revertsWithReason("2")
      await expect(podsUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("2")
    })
    it('does not supportFunction canStartAward', async () => {

      await podsRegistry.addPrizePools([mockContract.address])
      await prizeStrategy.mock.canCompleteAward.revertsWithReason("2")
      await expect(podsUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("2")

      
    })    
    it('does not supportFunction canCompleteAward', async () => {
      await prizeStrategy.mock.canStartAward.returns(false)
      await prizeStrategy.mock.canCompleteAward.revertsWithReason("2")
      await expect(podsUpkeep.callStatic.performUpkeep("0x")).to.be.revertedWith("2")
    })

  })
  


});
