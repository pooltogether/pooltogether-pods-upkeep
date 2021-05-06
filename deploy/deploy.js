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
    let { deployer, podsRegistry } = await getNamedAccounts()

    
    
    if(!podsRegistry){
      cyan(`No pods registry found in namedAccounts`)
      podsRegistry = ethers.constants.AddressZero
    }

    dim(`Deploying  contract from ${deployer}`)

    const podsUpkeepDeployResult = await deploy('PodsUpkeep', {
      args: [podsRegistry, deployer, 10, 20],
      from: deployer,
      skipIfAlreadyDeployed: false
    })
    green(`Deployed podsUpkeepDeployResult: ${podsUpkeepDeployResult.address}`)

}