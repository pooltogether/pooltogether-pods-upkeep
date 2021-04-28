const chalk = require('chalk');
const { getChainId } = require('hardhat');
const { factoryDeploy } = require('@pooltogether/pooltogether-proxy-factory-package')



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
    const { deployer, podsRegistry } = await getNamedAccounts()
    const namedSigners = await ethers.getNamedSigners()

    dim(`Deploying  contract from ${deployer}`)

    const podsUpkeepDeployResult = await deploy('PodsUpkeep', {
      args: [podsRegistry, deployer],
      from: deployer,
      skipIfAlreadyDeployed: false
    })
    green(`Deployed podsUpkeepDeployResult: ${podsUpkeepDeployResult.address}`)


  
    // do we want to add the governance prize pools and transfer ownership in here

}