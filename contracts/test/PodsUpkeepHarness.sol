// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "../PodsUpkeep.sol";


contract PodsUpkeepHarness is PodsUpkeep {

    function updateLastBlockNumberForPodIndex(uint256 _existingTimestamps, uint8 _podIndex, uint32 _value) external {
        _updateLastBlockNumberForPodIndex(_existingTimestamps, _podIndex, _value);
    }    

    function readLastBlockNumberForPodIndex(uint256 _existingTimestamps, uint8 _podIndex) external view returns (uint32) {
        return _readLastBlockNumberForPodIndex(_existingTimestamps, _podIndex);
    }

}