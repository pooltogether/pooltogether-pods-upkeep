# pooltogether-pods-operations

[![Coverage Status](https://coveralls.io/repos/github/pooltogether/pooltogether-operations-contracts/badge.svg?branch=main)](https://coveralls.io/github/pooltogether/pooltogether-operations-contracts?branch=main)


PoolTogether Operations contracts is PoolTogether's integration with ChainLinks upkeep system for pods.

## How it works

The goal of this system is to fully automate the awarding of the PoolTogether governance owned prize pools.

A registry of these prize pools exists (as an Ownable MappedSinglyLinkedList) and the prize strategy for each prize pool checked every block (`canStartAward()` and `canCompleteAward()`) to see if upkeep is required.

If upkeep is required then either `startAward()` or `completeAward()` are called on the prize pool. 

To prevent out-of-gas situations, a prize pool upkeep batch size is defined in the constructor. 

The upkeepers performing the upkeep are compensated in LINK so the PrizeStrategyUpkeep contact needs to maintain a balance of LINK. 

### Registry Interface



# Installation
Install the repo and dependencies by running:
`yarn`

## Deployment
These contracts can be deployed to a network by running:
`yarn deploy <networkName>`

# Testing
Run the unit tests locally with:
`yarn test`

## Coverage
Generate the test coverage report with:
`yarn coverage`