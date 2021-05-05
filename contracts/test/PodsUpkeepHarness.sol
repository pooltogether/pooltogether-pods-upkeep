// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "../PodsUpkeep.sol";

import "@pooltogether/pooltogether-generic-registry/contracts/AddressRegistry.sol";


contract PodsUpkeepHarness is PodsUpkeep {

    function updateLastBlockNumberForPodIndex(uint256 _existingTimestamps, uint8 _podIndex, uint32 _value) external view returns (uint256) {
       return  _updateLastBlockNumberForPodIndex(_existingTimestamps, _podIndex, _value);
    }    

    function wrappedReadLastBlockNumberForPodIndex(uint256 _existingTimestamps, uint8 _podIndex) external pure returns (uint32) {
        return _readLastBlockNumberForPodIndex(_existingTimestamps, _podIndex);
    }

    constructor (AddressRegistry _podsRegistry, address _owner, uint256 _upkeepBlockInterval, uint _batchLimit)
     PodsUpkeep(_podsRegistry, _owner, _upkeepBlockInterval, _batchLimit){

    }
}