const chalk = require('chalk');
const hardhat = require('hardhat')
const { increaseTime } = require('./helpers/increaseTime')

function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}

async function runForkScript(){
    const { getNamedAccounts, deployments, ethers } = hardhat
    const { deploy } = deployments
    const { deployer } = await getNamedAccounts()

    const batchSize = 5

    dim(`deploying PrizePoolRegistry contract from ${deployer}`)
    const prizePoolRegistry = await deploy('PrizePoolRegistry', {
      args: [],
      from: deployer,
      skipIfAlreadyDeployed: false
    })
    green(`Deployed PrizePoolRegistry: ${prizePoolRegistry.address}`)  

    dim(`deploying PrizeStrategyUpkeep contract from ${deployer}`)
    const prizePoolUpkeep = await deploy('PrizeStrategyUpkeep', {
      args: [prizePoolRegistry.address, batchSize],
      from: deployer,
      skipIfAlreadyDeployed: false
    })
    green(`Deployed PrizeStrategyUpkeep: ${prizePoolUpkeep.address}`)

    const prizeStrategyUpkeepContract = await ethers.getContract("PrizeStrategyUpkeep")

    // now add governance owned pools to Registry
    const registryContract = await ethers.getContract("PrizePoolRegistry")
    
    const daiPrizePoolAddress = "0xEBfb47A7ad0FD6e57323C8A42B2E5A6a4F68fc1a"
    const usdcPrizePoolAddress = "0xde9ec95d7708b8319ccca4b8bc92c0a3b70bf416"
    const uniPrizePoolAddress = "0x0650d780292142835F6ac58dd8E2a336e87b4393"

    await registryContract.addPrizePools([daiPrizePoolAddress, usdcPrizePoolAddress, uniPrizePoolAddress])
    green(`Added DAI, USDC and UNI prize pools to registry`)


    // IMPERSONATE TIMELOCK
    await ethers.provider.send("hardhat_impersonateAccount", ["0x42cd8312D2BCe04277dD5161832460e95b24262E"])
    const timelockSigner = ethers.provider.getUncheckedSigner("0x42cd8312D2BCe04277dD5161832460e95b24262E")

    const compoundPrizePoolAbi = require("../node_modules/@pooltogether/pooltogether-contracts/abis/CompoundPrizePool.json")
    const daiPrizePool = await ethers.getContractAt(compoundPrizePoolAbi, daiPrizePoolAddress)
    const usdcPrizePool = await ethers.getContractAt(compoundPrizePoolAbi, usdcPrizePoolAddress)
    const uniPrizePool = await ethers.getContractAt(compoundPrizePoolAbi, uniPrizePoolAddress)
    const periodicPrizeStrategy = require("../node_modules/@pooltogether/pooltogether-contracts/abis/PeriodicPrizeStrategy.json")
    const daiPrizeStrategy = await ethers.getContractAt(periodicPrizeStrategy, await daiPrizePool.prizeStrategy(), timelockSigner)
    const usdcPrizeStrategy = await ethers.getContractAt(periodicPrizeStrategy, await usdcPrizePool.prizeStrategy(), timelockSigner)
    const uniPrizeStrategy = await ethers.getContractAt(periodicPrizeStrategy, await usdcPrizePool.prizeStrategy(), timelockSigner)

    //fund timelock with Ether
    await ethers.provider.send("hardhat_impersonateAccount", ["0x564286362092D8e7936f0549571a803B203aAceD"])
    const binance = await ethers.provider.getUncheckedSigner('0x564286362092D8e7936f0549571a803B203aAceD')
    await binance.sendTransaction({ to: "0x42cd8312D2BCe04277dD5161832460e95b24262E", value: ethers.utils.parseEther('1000') })

    // change rng's
    if(await daiPrizeStrategy.rng() != '0xb1D89477d1b505C261bab6e73f08fA834544CD21') {
        dim(`Swapping RNG with blockhash on ${daiPrizeStrategy.address}...`)
        await daiPrizeStrategy.setRngService('0xb1D89477d1b505C261bab6e73f08fA834544CD21')     // msg.sender needs to be the timelock
    }
    if(await usdcPrizeStrategy.rng() != '0xb1D89477d1b505C261bab6e73f08fA834544CD21') {
        dim(`Swapping RNG with blockhash on ${usdcPrizeStrategy.address}...`)
        await usdcPrizeStrategy.setRngService('0xb1D89477d1b505C261bab6e73f08fA834544CD21')     // msg.sender needs to be the timelock
    }
    if(await uniPrizeStrategy.rng() != '0xb1D89477d1b505C261bab6e73f08fA834544CD21') {
        dim(`Swapping RNG with blockhash on ${usdcPrizeStrategy.address}...`)
        await uniPrizeStrategy.setRngService('0xb1D89477d1b505C261bab6e73f08fA834544CD21')     // msg.sender needs to be the timelock
    }

    // check if upkeep required
    const firstCheckUpkeepResult = (await prizeStrategyUpkeepContract.checkUpkeep("0x")).upkeepNeeded
    console.log("firstCheckUpkeepresult ", firstCheckUpkeepResult)
    if(!firstCheckUpkeepResult){
        dim(`Upkeep not yet required moving forwards`)
        const remainingTime = await daiPrizeStrategy.prizePeriodRemainingSeconds()
        dim(`Increasing time by ${remainingTime} seconds...`)
        await increaseTime(remainingTime.toNumber())


        const firstPerformUpkeepResult = await prizeStrategyUpkeepContract.performUpkeep("0x")
        const startAwardReceipt = await ethers.provider.getTransactionReceipt(firstPerformUpkeepResult.hash)
        const startAwardEvents = startAwardReceipt.logs.reduce((array, log) =>
        { try { array.push(daiPrizeStrategy.interface.parseLog(log)) } catch (e) {} return array }, [])
    
        const daiAwardStartedEvent = startAwardEvents.filter(event => event.name === 'PrizePoolAwardStarted')
        green(`StartedAward for ${daiAwardStartedEvent[0].args.prizePool}`)
        // move forwards two block
        await increaseTime(1)
        await increaseTime(1)
    }

    
    // now call checkUpkeep again
    const secondUpkeepCheck = await prizeStrategyUpkeepContract.checkUpkeep("0x")
    // console.log(secondCheckUpkeepResult[0].upkeepNeeded)

    console.log("secondUpkeepCheck? ", secondUpkeepCheck.upkeepNeeded)


    console.log("dai canCompleteAward", await daiPrizeStrategy.canCompleteAward())
    const secondPerformUpkeepResult = await prizeStrategyUpkeepContract.performUpkeep("0x")
    const completeAwardReceipt = await ethers.provider.getTransactionReceipt(secondPerformUpkeepResult.hash)
    const completeAwardEvents = completeAwardReceipt.logs.reduce((array, log) =>
    { try { array.push(daiPrizeStrategy.interface.parseLog(log)) } catch (e) {} return array }, [])
    const daiCompleteAwardEvent = completeAwardEvents.filter(event => event.name === 'PrizePoolAwarded')
    green(`Dai PrizePoolAwarded with: ${daiCompleteAwardEvent[0].args}`)


    const usdcStartAwardUpkeepCheck = await prizeStrategyUpkeepContract.checkUpkeep("0x")
    dim(`after dai awarded- upkeep required? ${usdcStartAwardUpkeepCheck}`)
    dim(`now moving to start USDC pool`)
    const remainingTime = await usdcPrizeStrategy.prizePeriodRemainingSeconds()
    dim(`Increasing time by ${remainingTime} seconds...`)
    await increaseTime(remainingTime.toNumber())
    
    const thirdCheckUpkeepResult = await prizeStrategyUpkeepContract.checkUpkeep("0x")

    if(thirdCheckUpkeepResult.upkeepNeeded){
        dim(`upkeep required`)
        console.log("usdc canCompleteAward" , await usdcPrizeStrategy.canStartAward())
        console.log("usdc canStartAward" , await usdcPrizeStrategy.canCompleteAward())
        const usdcStartAwardPerformUpkeepResult = await prizeStrategyUpkeepContract.performUpkeep("0x")
        const startAwardReceipt = await ethers.provider.getTransactionReceipt(usdcStartAwardPerformUpkeepResult.hash)
        const startAwardEvents = startAwardReceipt.logs.reduce((array, log) =>
        { try { array.push(usdcPrizeStrategy.interface.parseLog(log)) } catch (e) {} return array }, [])
    
        const usdcAwardStartedEvent = startAwardEvents.filter(event => event.name === 'PrizePoolAwardStarted')
        green(`USDC Award started with ${usdcAwardStartedEvent}`)
    }


}
runForkScript()