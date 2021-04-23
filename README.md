# pooltogether-pods-operations

[![Coverage Status](https://coveralls.io/repos/github/pooltogether/pooltogether-operations-contracts/badge.svg?branch=main)](https://coveralls.io/github/pooltogether/pooltogether-operations-contracts?branch=main)


PoolTogether Operations contracts is PoolTogether's integration with ChainLinks upkeep system for pods.

## How it works

The goal of this system is to automate calling the `batch` function of the PoolTogether governance owned prize pool pods.

A registry of these prize pools exists (as an Ownable MappedSinglyLinkedList) and logic is run to see if the batch function requires running. This is determined by:
- A time period (in blocks), as calculated by `upkeepBlockInterval`
- A float level calculation

To prevent out-of-gas situations, a prize pool upkeep batch size is defined in the constructor. 

The upkeepers performing the upkeep are compensated in LINK so the PrizeStrategyUpkeep contact needs to maintain a healthy balance of LINK. 

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