// SPDX-License-Identifier: MIT

pragma solidity ^0.6.8;

import "@pooltogether/pooltogether-contracts/contracts/prize-pool/PrizePool.sol";
import "@pooltogether/pooltogether-contracts/contracts/prize-strategy/PeriodicPrizeStrategy.sol";

contract MockContract {
    address public prizeStrategy;

    constructor(address _prizeStrategy) public {
        prizeStrategy = _prizeStrategy;
    }
}