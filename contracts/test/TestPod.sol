// SPDX-License-Identifier: MIT

pragma solidity ^0.7.6;

import "../interfaces/IPod.sol";

contract MockPod is IPod {

    function drop() external override returns (uint256){
        return 100;
    }
    
}