# pooltogether-pods-upkeep

[![Coverage Status](https://coveralls.io/repos/github/pooltogether/pooltogether-pods-upkeep/badge.svg?branch=main)](https://coveralls.io/github/pooltogether/pooltogether-pods-upkeep?branch=main)

![Tests](https://github.com/pooltogether/pooltogether-pods-upkeep/actions/workflows/main.yml/badge.svg)


PoolTogether Operations contracts is PoolTogether's integration with ChainLinks Upkeep system for pods.

## How it works

The goal of this system is to automate calling the `batch` function of the PoolTogether governance owned prize pool pods.

A registry of these prize pools exists (as an Ownable MappedSinglyLinkedList) and logic is run to see if the batch function requires running. This is determined by
a time period (in blocks): `upkeepBlockInterval`

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