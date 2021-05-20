const chalk = require('chalk');
const { getChainId } = require('hardhat');
const { factoryDeploy } = require('@pooltogether/pooltogether-proxy-factory-package');
const { cyan } = require('chalk');



function dim() {
  console.log(chalk.dim.call(chalk, ...arguments))
}

function green() {
  console.log(chalk.green.call(chalk, ...arguments))
}


module.exports = async (hardhat) => {

    console.log("running deploy script")

    console.log("network id ", await getChainId())

    const { getNamedAccounts, deployments, ethers } = hardhat
    const { deploy } = deployments
    let { deployer, owner, podsRegistry } = await getNamedAccounts()

    if(!podsRegistry){
      throw new Error(`No pods registry found in namedAccounts`)
    }

    dim(`Deploying contract from ${deployer}`)

    let batchIntervalInBlocks = 6171 // about once per day
    let batchSize = 3    

    const podsUpkeepDeployResult = await deploy('PodsUpkeep', {
      args: [podsRegistry, owner, batchIntervalInBlocks, batchSize],
      from: deployer,
      skipIfAlreadyDeployed: false
    })
 
    green(`Deployed podsUpkeepDeployResult: ${podsUpkeepDeployResult.address}`)

}